/**
 * FileName: common.login.customer-pwd-fail.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginCustPwdFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    res.render('member/common.member.login.cust-pwdfail.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default CommonMemberLoginCustPwdFail;
