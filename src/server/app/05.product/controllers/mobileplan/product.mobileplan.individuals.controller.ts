/**
 * FileName: product.mobileplan.individuals.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.12.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductMobilePlanIndividuals extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const uri = req.url.replace('/mobileplan/', '');

    if (uri === 'club-t') {
      res.render('mobileplan/product.mobileplan.club-t.html', { svcInfo });
    } else if (uri === 'campuszone') {
      res.render('mobileplan/product.mobileplan.campuszone.html', { svcInfo });
    } else if (uri === 'concierge') {
      res.render('mobileplan/product.mobileplan.concierge.html', { svcInfo });
    }
  }
}
