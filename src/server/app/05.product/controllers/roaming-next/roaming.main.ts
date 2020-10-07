/**
 * 로밍 메인 컨트롤러.
 *
 * BFF_10_0190: 첫로밍 판별
 * BFF_10_0055: 현재 이용중인 요금제 (최상단 카드)
 * BFF_10_0197: 최근 이용한 요금제
 * BFF_10_0199: 국가정보 조회
 * BFF_10_0198: 요금제 그룹 전체 조회
 *
 * 쿼리스트링 queryBg로 접근할 경우, 일정선택 팝업 상단에 표시할 국가 이미지를 XHR 로 제공.
 * 로컬환경의 경우, 빠른 유저 스위칭을 위한 코드가 있다.
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import moment from 'moment';
import RoamingHelper from './roaming.helper';
import {RoamingController} from './roaming.abstract';

export default class RoamingMainController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    if (req.query.queryBg) {
      const countryCode = req.query.queryBg;
      this.getCountryInfo(RoamingHelper.getMCC(countryCode)).subscribe(resp => {
        res.json({
          code: countryCode,
          backgroundUrl: resp.mblBgImg,
        });
      });
      return;
    }

    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    const debugTid = req.query.tid;
    if (debugTid && process.env['NODE_ENV'] === 'local') {
      if (!isLogin) {
        this.releaseDeadline(res);
        res.redirect('/product/roaming?userId=' + debugTid);
        return;
      }
      this.apiService.request(API_CMD.BFF_03_0001, {}).subscribe(r0 => {
        this.loginService.logoutSession(req, res).subscribe(r1 => {
          this.releaseDeadline(res);
          res.cookie('ROAMING_DTD', debugTid);
          res.redirect('/common/member/logout/complete?n=/product/roaming');
        });
      });
      return;
    }

    Observable.combineLatest(
      this.getPopularNations(),
      RoamingHelper.nationsByContinents(this.redisService),
      this.getCurrentUsingTariff(isLogin),
      this.getRecentUsedTariff(isLogin),
      this.getBanners(pageInfo),
      this.getFirstRoaming(isLogin),
      this.getTariffGroups(),
    ).subscribe(([popularNations, nations, currentUse, recentUse, banners, newbie, groups]) => {
      if (popularNations.length > 6) {
        popularNations = popularNations.slice(0, 6);
      }
      this.renderDeadline(res, 'roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        popularNations,
        nations,
        currentUse,
        recentUse,
        banners,
        newbie,
        groups,
      });
    });
  }

  private getFirstRoaming(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of({});
    }
    return this.apiService.request(API_CMD.BFF_10_0190, {}).map(r => r.result);
  }

  private getPopularNations(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.ROAMING_POPULAR_NATIONS).map(resp => {
      // countryCode
      // countryNameEng
      // countryNameKor
      // expsSeq
      // mblBtnImgId
      // mblBtnImgAltCtt
      const items = resp.result.roamingPopularNationList;
      if (items) {
        return items.sort((o1, o2) => {
          return parseInt(o1.expsSeq, 10) - parseInt(o2.expsSeq, 10);
        });
      }
      return [];
    });
  }

  private getCurrentUsingTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0055, {}).switchMap(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return Observable.of({code: resp.code, msg: resp.msg});
      }
      // prodInfoTxt: 'T로밍 OnePass300 기간형 외 2건",
      // feeProdYn: Y, 로밍요금제 여부
      // addProdYn: N, 로밍부가서비스 여부

      // [로밍개선과제] BFF_10_0055 결함을 FE 에서 막아보려 했으나 부작용으로 혼란만 가중되어 bypass 하였다.
      // if (resp.result.feeProdYn === 'Y') {
      //   return this.apiService.request(API_CMD.BFF_10_0056, {}).switchMap(r0 => {
      //     if (r0.result && r0.result.roamingProdList) {
      //       const prodList = r0.result.roamingProdList;
      //       if (prodList.length > 0) {
      //         return this.apiService.request(API_CMD.BFF_10_0091, null, null, [prodList[0].prodId]).map(r1 => {
      //           if (r1.result && r1.result.svcEndDt) {
      //             const endDate = moment(r1.result.svcEndDt, 'YYYYMMDD');
      //             const today = moment();
      //             if (today.isAfter(endDate)) {
      //               return null;
      //             }
      //           }
      //           if (r1.result && r1.result.svcStartDt) {
      //             const startDate = moment(r1.result.svcStartDt, 'YYYYMMDD');
      //             const today = moment().hours(0).minutes(0);
      //             if (today.isBefore(startDate)) {
      //               return null;
      //             }
      //           }
      //           return resp.result;
      //         });
      //       }
      //     }
      //     return Observable.of(resp.result);
      //   });
      // }
      return Observable.of(resp.result);
    });
  }

  private getRecentUsedTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0197, {}).map(resp => {
      if (resp.result && resp.result.prodId) {
        // 아래 상품은 원장 존재하지 않으므로 미표시
        // NA00005904 자동안심T로밍 데이터,
        // NA00004963 T로밍 Biz 요금제,
        // if (['NA00005904', 'NA00004963'].indexOf(resp.result.prodId) >= 0) {
        //   return null;
        // }

        // prodId, prodNm: 'baro 4GB',
        // svcStartDt, svcEndDt: '20190828',
        // startEndTerm: '30',
        const startDate = moment(resp.result.svcStartDt, 'YYYYMMDD');
        const endDate = moment(resp.result.svcEndDt, 'YYYYMMDD');
        // 아직 종료되지 않은 요금제는 표시하지 않기로 함
        if (endDate.isAfter(moment())) {
          return null;
        }
        return {
          prodId: resp.result.prodId,
          prodNm: resp.result.prodNm,
          nights: endDate.diff(startDate, 'days'),
          formattedStartDate: startDate.format('YYYY. M. D.'),
          formattedEndDate: endDate.format('YYYY. M. D.'),
        };
      }
      return null;
    });
  }

  private getCountryInfo(mcc: string): Observable<any> {
    if (mcc === '') {
      // 공통 이미지 읽어오기 위한 용도로 그리스 mcc 지정
      mcc = '202';
    }
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
      return resp.result;
    });
  }

  /**
   * 배너조회
   * @param pageInfo 페이지정보
   * @returns 성공 시 result에 상단, 중단 배너를 분류한 프로퍼티를 추가하여 반한하고, 실패 시 null 반환
   */
  private getBanners(pageInfo): Observable<any> {
    return this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId).map(resp => {
      if ( resp.code !== API_CODE.REDIS_SUCCESS ) {
        // 부분 차단
        return null;
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      if (resp.result.banners) {
        return resp.result.banners;
      }
      return null;
    });
  }

  /**
   * 요금제그룹 목록 조회
   * @private
   */
  private getTariffGroups(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      // prodGrpId: T0000094
      // prodGrpNm: baro 3/4/7
      // prodGrpDesc: 장거리 또는 ..
      // prodGrpBnnrImgUrl: /adminupload/
      return items;
    });
  }
}
