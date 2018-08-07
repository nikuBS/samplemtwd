/**
 * FileName: auth.error.empty-line.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthErrorEmptyLine extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('error/auth.error.empty-line.html', { svcInfo });
  }
}

export default AuthErrorEmptyLine;
