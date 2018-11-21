/**
 * FileName: product.roaming.fi.inquire-auth.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

export default class ProductRoamingFiInquireAuth extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_10_0067, { page: 1, rentfrom : 20180322 , rentto : 20181107 }).subscribe((resp) => {

      const getTFiData = resp;
      console.log('response : ' , JSON.stringify(resp));
      res.render('roaming/product.roaming.fi.inquire-auth.html', {
        getTFiData: getTFiData,
        svcInfo: svcInfo
      });
    });
  }

  private getPlans(params) {
    return this.apiService.request(API_CMD.BFF_10_0031, params).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        products: resp.result.products.map(plan => {
          return {
            ...plan,
            basFeeAmt: FormatHelper.getFeeContents(plan.basFeeAmt)
          };
        })
      };
    });
  }
}
