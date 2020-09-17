import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';
import DateHelper from '../../../../utils/date.helper';

export default class RoamingMyUseController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    Observable.combineLatest(
      this.getMyTariffs(),
      this.getMyAddons(),
    ).subscribe(([tariffs, addons]) => {
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

      Observable.combineLatest(tariffs.map(t => {
        return this.apiService.request(API_CMD.BFF_10_0091, {}, {}, ['NA00005505']).map(r => {
          if (r.code === API_CODE.CODE_00 && r.result) {
            return r.result;
          }
          return null;
        });
      })).subscribe((ranges) => {
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
          Object.assign(tariffs[i], ranges[i]);
          console.log(ranges[i]);
          // 기간별 formatting 처리
        }
        res.render('roaming-next/roaming.myuse.html', {
          svcInfo,
          pageInfo,
          tariffs,
          addons,
        });
      });
    });
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
