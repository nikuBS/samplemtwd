import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeRefillGift extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refill/recharge.refill.gift.html', {
      copnNm: req.query.copnNm,
      svcInfo
    });
  }
}

export default RechargeRefillGift;
