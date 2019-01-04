/**
 * FileName: product.roaming.info.center.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingInfoCenter extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('roaming/product.roaming.info.center.html', { svcInfo , pageInfo });
  }
}
