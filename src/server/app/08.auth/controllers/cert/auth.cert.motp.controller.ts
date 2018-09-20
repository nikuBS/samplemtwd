/**
 * FileName: auth.cert.motp.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthCertMotp extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cert/auth.cert.motp.html');
  }
}

export default AuthCertMotp;
