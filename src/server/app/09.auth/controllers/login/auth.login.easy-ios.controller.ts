/**
 * FileName: auth.login.easy-ios.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthLoginEasyIos extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('login/auth.login.easy-ios.html', { svcInfo });
  }
}

export default AuthLoginEasyIos;
