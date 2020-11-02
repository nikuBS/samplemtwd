/**
 * @desc 로밍 나의 이용현황.
 *
 * BFF_10_0091: 요금제 사용 기간 조회
 * BFF_10_0056: 이용중인 요금제
 * BFF_10_0057: 이용중인 부가서비스
 * BFF_10_0201: 로밍 데이터 사용량 조회
 *
 * @author 황장호
 * @since 2020-09-01
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';
import DateHelper from '../../../../utils/date.helper';
import RoamingHelper from './roaming.helper';
import {RoamingController} from './roaming.abstract';

export default class RoamingMyUseController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    Observable.combineLatest(
      this.getMyTariffs(),
      this.getMyAddons(),
      // 로밍 실시간 데이터 잔여량
      this.apiService.request(API_CMD.BFF_05_0201, {}).map(resp => {
        const error = RoamingHelper.checkBffError(resp);
        if (error) { return error; }
        return resp.result;
      }),
    ).subscribe(([tariffs, addons, dataUsages]) => {
      if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo, [tariffs, addons])) {
        this.releaseDeadline(res);
        return;
      }

      // prodId, prodNm, scrbDt (2019.1.23.),
      // basFeeTxt (39,000),
      // prodLinkYn, prodSetYn, prodTermYn
      // linkProdId
      tariffs = tariffs.roamingProdList;
      // prodId, prodNm, scrbDt (2018.3.18.)
      // basFeeTxt 무료,
      // prodLinkYn, prodSetYn, prodTermYn
      // linkProdId
      addons = addons.roamingProdList;

      const context = {
        svcInfo,
        pageInfo,
        addons, // 부가서비스 목록
        tariffs: [], // 요금제 목록
        now: moment(),
        nowDate: moment().hours(0).minutes(0).seconds(0).milliseconds(0)
      };

      if (tariffs.length > 0) {
        Observable.combineLatest(tariffs.map(t => {
          // 이용 중인 모든 요금제에 대하여, BFF_10_0091(기간 조회 API)를 호출한다.
          // 스펙 상, 이용기간을 표시해야 하고, 이용기간에 따라 '이용 예정', '이용 중', '이용 완료' 표시를 하기 위함이다.
          return this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [t.prodId]).map(r => {
            const error = RoamingHelper.checkBffError(r);
            if (error) { return error; }
            if (r.result) {
              return r.result;
            }
            return null;
          });
        })).subscribe((ranges) => {
          if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo, [ranges])) {
            this.releaseDeadline(res);
            return;
          }

          // BFF_10_0091(기간조회) 응답을 기존 tariffs 객체에 병합.
          this.mergeRanges(tariffs, ranges, dataUsages);
          const filtered: any = [];
          for (const t of tariffs) {
            // [로밍개선과제] 이용완료 상품 미표시가 SB에 있으나, 혼란 가중되어 살려둠
            // if (t.endDate && t.endDate.isBefore(context.now)) {
            //   continue;
            // }
            filtered.push(t);
          }
          context.tariffs = filtered;
          this.renderDeadline(res, 'roaming-next/roaming.myuse.html', context);
        });
      } else {
        this.renderDeadline(res, 'roaming-next/roaming.myuse.html', context);
      }
    });
  }

  /**
   * 이용하는 요금제 목록에 기간 정보를 병합하고,
   * 요금제 그룹(14)에 따라 데이터 잔여량도 병합한다.
   *
   * @param tariffs 이용하는 요금제 목록
   * @param ranges 요금제 기간 정보 (BFF_10_0091 결과값들)
   * @param dataUsages 로밍 실시간 데이터 잔여량 (BFF_05_0201 결과값)
   * @private
   */
  private mergeRanges(tariffs: any[], ranges: any[], dataUsages: any) {
    for (let i = 0; i < tariffs.length; i++) {
      // svcStartDt: 20200603
      // svcStartTm: 17
      // svcEndDt: 20200703
      // svcEndTm: 17
      // startEndTerm: 30
      // prodFee: '39000'
      // romSetClCd: DNNN: 개시일, DTNN:개시일+시간, DTDN:개시일+시간~종료일, NNNN:설정없음
      //   romSetClCd 값은 항상 정확하지 않아서 사용하지 않고, svcStartDt/svcEndDt 존재여부로 파악하였다.
      // chk60: Y
      // chkCurProdStat: true
      const range: any = ranges[i];
      const t = tariffs[i];
      Object.assign(t, ranges[i]);
      t.group = RoamingHelper.getTariffGroup(t.prodId);
      t.data = null;
      t.phone = null;
      t.sms = null;

      // 기간별 날짜/시간 포매팅
      t.startDate = moment(range.svcStartDt, 'YYYYMMDD');
      if (range.svcEndDt) {
        t.endDate = moment(range.svcEndDt, 'YYYYMMDD');
      } else {
        t.endDate = null;
      }
      t.startTime = '';
      t.endTime = '';
      if (range.svcStartTm) { // BFF 에서 시작시각이 '17' 형태로 넘어온다.
        t.startTime = ` ${range.svcStartTm}:00`;
        if (t.startDate) {
          t.startDate.add(parseInt(range.svcStartTm, 10), 'hours');
        }
      }
      if (range.svcEndTm) { // BFF 에서 종료시각이 '09' 형태로 넘어온다.
        t.endTime = ` ${range.svcEndTm}:00`;
        if (t.endDate) {
          t.endDate.add(parseInt(range.svcEndTm, 10), 'hours');
        }
      }

      // 요금제 그룹 6, 13은 SMS/전화 30건/30분 제공
      if ([6, 13].indexOf(t.group) >= 0) {
        t.sms = {total: '30건'};
        t.phone = {total: '30분'};
      }
      // 요금제 그룹 2, 4는 SMS 기본제공
      if ([2, 4].indexOf(t.group) >= 0) {
        t.sms = {total: '기본제공'};
      }

      // DATA --------
      // 요금제 그룹 1~4는 로밍 실시간 데이터 잔여량이 제공되므로 이 값을 병합
      if ([1, 2, 3, 4].indexOf(t.group) >= 0 && dataUsages && dataUsages.used && dataUsages.total) {
        // 잔여량 포매팅
        if (parseInt(dataUsages.used, 10) > 1024) {
          dataUsages.used = Math.floor(parseInt(dataUsages.used, 10) / 1024);
          dataUsages.unitUsed = 'GB';
        } else {
          dataUsages.unitUsed = 'MB';
        }
        // total 값 포매팅
        if (parseInt(dataUsages.total, 10) > 1024) {
          dataUsages.total = Math.floor(parseInt(dataUsages.total, 10) / 1024);
          dataUsages.unitTotal = 'GB';
        } else {
          dataUsages.unitTotal = 'MB';
        }
        t.data = {
          used: dataUsages.used + ' ' + dataUsages.unitUsed,
          total: dataUsages.total + ' ' + dataUsages.unitTotal,
        };
      }
      // 요금제 그룹 7은 일일 제공량.
      if (t.group === 7) {
        const m = new RegExp('[0-9]{2,3}').exec(t.prodNm);
        if (m) {
          t.data = { used: null, total: m[0] + 'MB (일)'};
        } else {
          t.data = { used: null, total: '-'};
        }
      }
      // 요금제 그룹 8은 괌사이판
      if (t.group === 8) {
        t.data = { used: null, total: '500MB (일)'};
      }
      // 요금제 그룹 9는 T로밍 중국 플러스
      if (t.group === 9) {
        t.data = { used: null, total: '300MB (일)'};
      }
      // 요금제 그룹 10은 팅/실버 무한톡
      if (t.group === 10) {
        t.data = { used: null, total: '제한속도 데이터 제공'};
      }
      // 요금제 그룹 5, 6, 12, 13은 데이터 항상 무제한
      if ([5, 6, 12, 13].indexOf(t.group) >= 0) {
        t.data = { used: null, total: '무제한'};
      }
      // 요금제 그룹 14는 baro OnePass 300/500 기본형
      if (t.group === 14) {
        const m = new RegExp('[0-9]{2,3}').exec(t.prodNm);
        if (m) {
          t.data = { used: null, total: m[0] + 'MB (일)'};
        } else {
          t.data = { used: null, total: '-'};
        }
      }
    }

  }

  /**
   * 이용 중인 요금제 목록.
   * BFF_10_0056
   *
   * @private
   */
  private getMyTariffs(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0056, {}).map((resp) => {
      return this._mapResult(resp);
    });
  }

  /**
   * 이용 중인 부가서비스 목록.
   * BFF_10_0057
   *
   * @private
   */
  private getMyAddons(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      return this._mapResult(resp);
    });
  }

  /**
   * 이용 중인 부가서비스와 요금제 목록 결과를 정규화.
   * 기존 코드인 product.roaming.my-use.controller.ts 의 getRoamingFeePlan 함수를 옮겨왔다.
   *
   * @param resp BFF API 응답 객체
   * @private
   */
  private _mapResult(resp) {
    const error = RoamingHelper.checkBffError(resp);
    if (error) { return error; }

    if (FormatHelper.isEmpty(resp.result)) {
      resp.result.roamingProdList = [];
      return resp.result;
    }

    return {
      ...resp.result,
      roamingProdList: resp.result.roamingProdList.map(prod => {
        return {
          ...prod,
          basFeeTxt: FormatHelper.getFeeContents(prod.basFeeTxt === '0' ? '무료' : prod.basFeeTxt),
          scrbDt: DateHelper.getShortDate(prod.scrbDt),
          btnList: prod.prodSetYn !== 'Y' ? [] : prod.btnList.filter(btn => btn.btnTypCd === 'SE')
        };
      })
    };
  }
}
