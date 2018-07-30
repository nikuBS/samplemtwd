/**
 * FileName: customer.shop.detail.controller.ts (CI_02_04)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerShopDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const shopCode = req.query.code;

    // TODO: requets shop detail info
    res.render('./shop/customer.shop.detail.html', { svcInfo: svcInfo });
  }
}

export default CustomerShopDetailController;
