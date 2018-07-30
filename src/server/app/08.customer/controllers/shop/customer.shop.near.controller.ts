/**
 * FileName: customer.shop.near.controller.ts (CI_02_05)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerShopNearController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    res.render('./shop/customer.shop.near.html', { svcInfo: svcInfo });
  }
}

export default CustomerShopNearController;
