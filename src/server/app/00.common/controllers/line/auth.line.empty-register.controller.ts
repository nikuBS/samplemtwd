/**
 * FileName: auth.line.empty-register.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthLineEmptyRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('line/auth.line.empty-register.html', { svcInfo });
  }
}

export default AuthLineEmptyRegister;
