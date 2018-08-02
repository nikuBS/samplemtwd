/**
 * FileName: customer.shop.repair-manufacturer.controller.ts (CI_03_02)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.08.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerShopRepairManufacturerController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    res.render('./shop/customer.shop.repair-manufacturer.html', { svcInfo: svcInfo });
  }
}

export default CustomerShopRepairManufacturerController;

