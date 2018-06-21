/**
 * FileName: recharge.refill.gift.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.06.21
 */

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
