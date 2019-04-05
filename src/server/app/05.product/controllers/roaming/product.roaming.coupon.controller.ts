/**
 * @file product.roaming.coupon.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.11.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingCoupon extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const bpcpServiceId = req.query.bpcpServiceId || '';

    res.render('roaming/product.roaming.coupon.html', { svcInfo , pageInfo, bpcpServiceId : bpcpServiceId });
  }
}
