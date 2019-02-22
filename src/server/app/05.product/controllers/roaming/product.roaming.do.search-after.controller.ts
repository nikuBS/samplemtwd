/**
 * FileName: product.roaming.do.search-after.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingSearchAfter extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('roaming/product.roaming.do.search-after.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingSearchAfter;

