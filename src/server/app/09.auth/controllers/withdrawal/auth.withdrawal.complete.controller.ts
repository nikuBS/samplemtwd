/**
 * FileName: auth.withdrawal.complete.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthWithdrawlComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const isTid = req.query.tid === 'Y' ? true : false;
    res.render('withdrawal/auth.withdrawal.complete.html', { tid: isTid });
  }
}

export default AuthWithdrawlComplete;
