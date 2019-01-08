/**
 * FileName: product.mobileplan.list.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductPlans extends TwViewController {
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

      res.render('mobileplan/product.mobileplan.list.html', { svcInfo, plans, params, pageInfo });
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
            basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeAmt),
            basOfrDataQtyCtt: this.isEmptyAmount(plan.basOfrDataQtyCtt) ? null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrDataQtyCtt),
            basOfrVcallTmsCtt: this.isEmptyAmount(plan.basOfrVcallTmsCtt) ? 
              null : 
              ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this.isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
            filters: plan.filters.filter(filter => {
              return /^F011[2|3|6]/.test(filter.prodFltId);
            })
          };
        })
      };
    });
  }

  private isEmptyAmount(value: string) {
    return !value || value === '' || value === '-';
  }
}
