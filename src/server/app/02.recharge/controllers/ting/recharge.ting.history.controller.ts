/**
 * FileName: recharge.ting.history.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class RechargeTingHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('ting/recharge.ting.history.html', { svcInfo: svcInfo });
  }
}

export default RechargeTingHistory;
