/**
 * @file common.cert.motp.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonCertMotp extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('cert/common.cert.motp.html', { pageInfo });
  }
}

export default CommonCertMotp;
