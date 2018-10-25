/**
 * FileName: product.find-my-best-plans.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class ProductFindMyBestPlans extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('product.find-my-best-plans.html', {
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default ProductFindMyBestPlans;
