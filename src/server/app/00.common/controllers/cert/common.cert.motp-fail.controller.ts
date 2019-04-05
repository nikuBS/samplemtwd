/**
 * FileName: common.cert.motp-fail.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonCertMotpFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('cert/common.cert.motp-fail.html', { pageInfo });
  }
}

export default CommonCertMotpFail;
