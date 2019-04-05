/**
 * @file product.roaming.info.ph-book.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.1.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingInfoPhBook extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('roaming/product.roaming.info.ph-book.html', { svcInfo , pageInfo });
  }
}
