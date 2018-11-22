/**
 * FileName: common.login.customer-pwd.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginCustPwd extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('member/common.member.login.cust-pwd.html', { svcInfo: svcInfo });
  }
}

export default CommonMemberLoginCustPwd;
