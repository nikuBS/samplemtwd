import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';
import DateHelper from '../../../../utils/date.helper';
import RoamingHelper from './roaming.helper';

export default class RoamingMyUseController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    Observable.combineLatest(
      this.getMyTariffs(),
      this.getMyAddons(),
      this.apiService.request(API_CMD.BFF_05_0201, {}).map(resp => resp.result),
    ).subscribe(([tariffs, addons, dataUsages]) => {
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
        addons,
        tariffs: [],
        now: moment().hours(0).minutes(0).seconds(0).milliseconds(0),
      };

      if (tariffs.length > 0) {
        Observable.combineLatest(tariffs.map(t => {
          return this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [t.prodId]).map(r => {
            if (r.code === API_CODE.CODE_00 && r.result) {
              return r.result;
            }
            return null;
          });
        })).subscribe((ranges) => {
          try {
            this.mergeRanges(tariffs, ranges, dataUsages);
            const filtered: any = [];
            for (const t of tariffs) {
              if (t.endDate && t.endDate.isBefore(context.now)) {
                continue;
              }
              filtered.push(t);
            }
            context.tariffs = filtered;
            res.render('roaming-next/roaming.myuse.html', context);
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        res.render('roaming-next/roaming.myuse.html', context);
      }
    });
  }

  private mergeRanges(tariffs: any[], ranges: any[], dataUsages: any) {
    for (let i = 0; i < tariffs.length; i++) {
      // svcStartDt: 20200603
      // svcStartTm: 17
      // svcEndDt: 20200703
      // svcEndTm: 17
      // startEndTerm: 30
      // prodFee: '39000'
      // romSetClCd: DNNN: 개시일, DTNN:개시일+시간, DTDN:개시일+시간~종료일, NNNN:설정없음
      // chk60: Y
      // chkCurProdStat: true
      const range: any = ranges[i];
      const t = tariffs[i];
      Object.assign(t, ranges[i]);
      t.group = RoamingHelper.getTariffGroup(t.prodId);
      t.data = null;
      t.phone = null;
      t.sms = null;

      // 기간별 처리
      t.startDate = moment(range.svcStartDt, 'YYYYMMDD');
      if (range.svcEndDt) {
        t.endDate = moment(range.svcEndDt, 'YYYYMMDD');
      } else {
        t.endDate = null;
      }
      t.startTime = '';
      t.endTime = '';
      if (range.svcStartTm) {
        t.startTime = ` ${range.svcStartTm}:00`;
      }
      if (range.svcEndTm) {
        t.endTime = ` ${range.svcEndTm}:00`;
      }

      if ([6, 13].indexOf(t.group) >= 0) {
        t.sms = {total: '30건'};
        t.phone = {total: '30분'};
      }
      if ([2, 4].indexOf(t.group) >= 0) {
        t.sms = {total: '기본제공'};
      }

      // DATA --------
      if ([1, 2, 3, 4].indexOf(t.group) >= 0 && dataUsages) {
        if (parseInt(dataUsages.used, 10) > 1024) {
          dataUsages.used = Math.floor(parseInt(dataUsages.used, 10) / 1024);
          dataUsages.unitUsed = 'GB';
        } else {
          dataUsages.unitUsed = 'MB';
        }
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
      if (t.group === 7) {
        const m = new RegExp('[0-9]+').exec(t.prodNm);
        if (m) {
          t.data = { used: null, total: m[0] + 'MB (일)'};
        } else {
          t.data = { used: null, total: '-'};
        }
      }
      if (t.group === 8) {
        t.data = { used: null, total: '500MB (일)'};
      }
      if (t.group === 9) {
        t.data = { used: null, total: '300MB (일)'};
      }
      if (t.group === 10) {
        t.data = { used: null, total: '제한속도 데이터 제공'};
      }
      if ([5, 6, 12, 13].indexOf(t.group) >= 0) {
        t.data = { used: null, total: '무제한'};
      }
      if (t.group === 14) {
        t.data = { used: null, total: '300MB (일)'};
      }
    }

  }

  private getMyTariffs(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0056, {}).map((resp) => {
        return this._mapResult(resp);
      });
  }

  private getMyAddons(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      return this._mapResult(resp);
    });
  }

  private _mapResult(resp) {
    if (resp.code !== API_CODE.CODE_00) {
      return { code: resp.code, msg: resp.msg };
    }

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
