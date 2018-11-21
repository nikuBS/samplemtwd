/**
 * FileName: product.roaming.fi.guide.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

export default class ProductRoamingFi extends TwViewController {
  private PLAN_CODE = 'F01100';

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const params = {
      idxCtgCd: this.PLAN_CODE,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.tag ? { searchTagId: req.query.tag } : {})
    };

    this.getPlans(params).subscribe(plans => {
      if (plans.code) {
        this.error.render(res, {
          code: plans.code,
          msg: plans.msg,
          svcInfo: svcInfo
        });
      }

      res.render('roaming/product.roaming.fi.guide.html', { svcInfo, plans, params, pageInfo });
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
