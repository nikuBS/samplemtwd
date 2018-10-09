/**
 * FileName: product.plans.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { PRODUCT_PLANS } from '../../../mock/server/product.list.mock';
import { API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

export default class ProductPlans extends TwViewController {
  private PLAN_CODE = 'F01100';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _layerType: string) {
    // this.getPlans({}).subscribe(resp => {
    //   console.log(JSON.stringify(resp));
    // });
    const params = {
      searchFltIds: req.query.filters,
      searchTag: req.query.tag
    };

    const plans = this.getPlans(params);

    res.render('product.plans.html', { svcInfo, plans, params });
  }

  private getPlans(_params: { searchFltIds?: string; searchTag?: string }) {
    // return this.apiService.request(API_CMD.BFF_10_0031, { idxCtgCd: this.PLAN_CODE, searchFltIds: 'F01121' });
    const resp = PRODUCT_PLANS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
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
  }
}
