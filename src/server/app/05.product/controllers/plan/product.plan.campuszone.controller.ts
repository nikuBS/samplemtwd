/**
 * FileName: product.plan.campuszone.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductPlanCampuszone extends TwViewController {
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, _pageInfo: any) {
    res.render('plan/product.plan.campuszone.html', { svcInfo });
  }
}
