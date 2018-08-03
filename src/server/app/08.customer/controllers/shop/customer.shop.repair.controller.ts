/**
 * FileName: customer.shop.repair.controller.ts (CI_03_01)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.08.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerShopRepairController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    res.render('./shop/customer.shop.repair.html', { svcInfo: svcInfo });
  }
}

export default CustomerShopRepairController;
