/**
 * FileName: auth.login.service-pwd-fail.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthLoginServicePwdFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('login/auth.login.service-pwd-fail.html', { svcInfo: svcInfo });
  }
}

export default AuthLoginServicePwdFail;
