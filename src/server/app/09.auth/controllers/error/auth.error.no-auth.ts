/**
 * FileName: auth.error.no-auth.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { SVC_ATTR } from '../../../../types/bff.type';

class AuthErrorNoAuth extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = {
      showSvc: svcInfo.svcAttrCd.indexOf('S') === -1 ? svcInfo.svcNum : svcInfo.addr,
      showAttr: SVC_ATTR[svcInfo.svcAttrCd]
    };
    res.render('error/auth.error.no-auth.html', { data, svcInfo });
  }
}

export default AuthErrorNoAuth;
