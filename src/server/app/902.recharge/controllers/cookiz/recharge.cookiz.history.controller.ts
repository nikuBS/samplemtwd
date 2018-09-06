/**
 * FileName: recharge.cookiz.history.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.03
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class RechargeCookizHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cookiz/recharge.cookiz.history.html', { svcInfo: svcInfo });
  }
}

export default RechargeCookizHistory;
