import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTRefillGiftProducts extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refillrecharge/refill/refill.gift-products.html', {});
  }
}

export default MyTRefillGiftProducts;
