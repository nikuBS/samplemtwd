/**
 * FileName: product.plans.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

export default class ProductPlans extends TwViewController {
  private PLAN_CODE = 'F01100';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _layerType: string) {
    const params = {
      idxCtgCd: this.PLAN_CODE,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.tag ? { searchTag: req.query.tag } : {})
    };

    this.getPlans(params).subscribe(plans => {
      if (plans.code) {
        this.error.render(res, {
          code: plans.code,
          msg: plans.msg,
          svcInfo: svcInfo
        });
      }

      res.render('product.plans.html', { svcInfo, plans, params });
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
