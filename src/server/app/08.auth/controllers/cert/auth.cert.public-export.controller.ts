/**
 * FileName: auth.cert.public-export.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthCertPublicExport extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cert/auth.cert.public-export.html');
  }
}

export default AuthCertPublicExport;
