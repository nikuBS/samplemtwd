/**
 * FileName: common.login.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CommonMemberLogin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/error.login-block.html', { target, svcInfo, pageInfo });
  }
}

export default CommonMemberLogin;
