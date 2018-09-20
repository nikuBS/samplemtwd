/**
 * FileName: auth.cert.motp-fail.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthCertMotpFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cert/auth.cert.motp-fail.html');
  }
}

export default AuthCertMotpFail;
