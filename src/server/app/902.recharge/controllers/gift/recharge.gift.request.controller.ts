/**
 * FileName: recharge.gift.request.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.21
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeGiftRequestProcess extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('gift/recharge.gift.request.process.html', { svcInfo: svcInfo });
  }
}

export default RechargeGiftRequestProcess;
