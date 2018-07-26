/**
 * FileName: customer.shop-search.controller.ts (CI_02_01)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerShopSearchController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    res.render('./shop/customer.shop.search.html', { svcInfo: svcInfo });
  }
}

export default CustomerShopSearchController;
