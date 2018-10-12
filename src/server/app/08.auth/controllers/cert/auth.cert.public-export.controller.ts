/**
 * FileName: auth.cert.public-export.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import EnvHelper from '../../../../utils/env.helper';

class AuthCertPublicExport extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const signgateInfo = EnvHelper.getEnvironment('SIGNGATE');
    res.render('cert/auth.cert.public-export.html', {
      signgate_host: signgateInfo.host,
      signgate_port: signgateInfo.port
    });
  }
}

export default AuthCertPublicExport;
