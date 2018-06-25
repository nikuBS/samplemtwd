/**
 * FileName: recharge.refill.error.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.18
 **/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeRefillError extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('error/recharge.refill.error.html', {});
  }
}

export default RechargeRefillError;
