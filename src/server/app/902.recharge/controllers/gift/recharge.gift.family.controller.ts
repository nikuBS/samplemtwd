/**
 * FileName: recharge.gift.family.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.21
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class RechargeGiftFamilyProcess extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('gift/recharge.gift.family.process.html', { svcInfo: svcInfo });
  }
}

export default RechargeGiftFamilyProcess;
