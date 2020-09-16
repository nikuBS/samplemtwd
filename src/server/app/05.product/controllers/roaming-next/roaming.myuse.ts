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
      const useTestData = false;
      if (useTestData) {
        tariffs = [{
          prodId: 'NA00006489',
          prodNm: 'baro 3G',
          dateStart: '202009141300',
          dateEnd: '202009211800',
          usage: {
            data: { used: '120MB', total: '500MB' },
            sms: { total: '30' },
            voice: { total: '30' }
          }
        }];
        addons = [{
          prodId: 'NA00003200',
          prodNm: 'T로밍 도착알리미',
          dateRegister: '20200911',
          link: {
            url: 'https://google.com/',
            name: '지정번호 등록',
          }
        }];
      } else {
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
      }
      console.log(tariffs);
      console.log(addons);

      res.render('roaming-next/roaming.myuse.html', {
        svcInfo,
        pageInfo,
        tariffs,
        addons,
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
