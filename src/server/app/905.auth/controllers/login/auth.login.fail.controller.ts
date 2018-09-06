/**
 * FileName: auth.login.fail.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthLoginFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const errorCode = req.query.errorCode;
    res.render('login/auth.login.fail.html', { errorCode, svcInfo });
  }
}

export default AuthLoginFail;
