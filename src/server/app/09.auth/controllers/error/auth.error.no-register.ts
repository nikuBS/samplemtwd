/**
 * FileName: auth.error.no-register.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthErrorNoRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('error/auth.error.no-register.html', { svcInfo });
  }
}

export default AuthErrorNoRegister;
