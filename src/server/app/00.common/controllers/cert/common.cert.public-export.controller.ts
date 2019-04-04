/**
 * @file common.cert.public-export.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import EnvHelper from '../../../../utils/env.helper';

class CommonCertPublicExport extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const signgateInfo = EnvHelper.getEnvironment('SIGNGATE');
    res.render('cert/common.cert.public-export.html', {
      signgate_host: signgateInfo.host,
      signgate_port: signgateInfo.port,
      pageInfo
    });
  }
}

export default CommonCertPublicExport;
