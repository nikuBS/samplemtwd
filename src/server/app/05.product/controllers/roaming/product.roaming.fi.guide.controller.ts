/**
 * @file product.roaming.fi.guide.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.11.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiGuide extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
      res.render('roaming/product.roaming.fi.guide.html', { svcInfo, pageInfo });
  //    res.render('roaming/product.roaming.fi.guide.test.html', { svcInfo, pageInfo });
  }
}
