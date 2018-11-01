/**
 * FileName: auth.login.find-id-pwd.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthLoginFindIdPwd extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('login/auth.login.find-id-pwd.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default AuthLoginFindIdPwd;
