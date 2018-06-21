import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeRefillGiftProducts extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refill/refill.gift-products.html', {});
  }
}

export default RechargeRefillGiftProducts;
