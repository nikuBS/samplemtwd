/**
 * FileName: recharge.refill.gift-products.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.06.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeRefillGiftProducts extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refill/recharge.refill.gift-products.html', {
      svcInfo
    });
  }
}

export default RechargeRefillGiftProducts;
