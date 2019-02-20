/**
 * FileName: product.roaming.my-use.controller.ts
 * Author: Juho Kim (jhkim@pineone.com)
 * Date: 2018.11.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import BFF_10_0056_mock from '../../../../mock/server/product.BFF_10_0056.mock';

export default class ProductRoamingMyUse extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (this.isLogin(svcInfo)) {
      Observable.combineLatest(
        this.getRoamingFeePlan(),
        this.getRoamingAdd(),
        this.getWirelessAdd()
      ).subscribe(([roamingFeePlan, roamingAdd, wirelessAdd]) => {

        const error = {
          code:　roamingFeePlan.code || roamingAdd.code || wirelessAdd.code,
          msg:　roamingFeePlan.msg || roamingAdd.msg || wirelessAdd.msg
        };

        if (error.code) {
          return this.error.render(res, { ...error, svcInfo });
        }

        res.render('roaming/product.roaming.my-use.html', { svcInfo, pageInfo, roamingFeePlan, roamingAdd , wirelessAdd, isLogin: this.isLogin(svcInfo)});
      });
    } else {
      res.render('roaming/product.roaming.my-use.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo)});
    }
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }

  private getRoamingFeePlan(): Observable<any> {
    // return Observable.of(BFF_10_0056_mock)
    return this.apiService.request(API_CMD.BFF_10_0056, {})
      .map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
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
            basFeeTxt: (prod.basFeeTxt === "" || prod.basFeeTxt === "무료") ? "0" : FormatHelper.numberWithCommas(Number(prod.basFeeTxt)),
            scrbDt: DateHelper.getShortMonthDate(prod.scrbDt),
            btnList: prod.prodSetYn !== 'Y' ? [] : prod.btnList.filter(btn => btn.btnTypCd === "SE")
          };
        })
      };
    });
  }

  private getRoamingAdd(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
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
            basFeeTxt: (prod.basFeeTxt === "" || prod.basFeeTxt === "무료") ? "0" : FormatHelper.numberWithCommas(Number(prod.basFeeTxt)),
            scrbDt: DateHelper.getShortMonthDate(prod.scrbDt),
            btnList: prod.prodSetYn !== 'Y' ? [] : prod.btnList.filter(btn => btn.btnTypCd === "SE")
          };
        })
      };
    });
  }

  /**
   * T로밍 도착알리미 가입 여부
   */
  private getWirelessAdd(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0040, {}, {}, ['NA00003200']).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

}
