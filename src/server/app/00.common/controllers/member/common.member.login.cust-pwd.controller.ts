/**
 * FileName: common.login.customer-pwd.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginCustPwd extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.cust-pwd.html', { svcInfo: svcInfo, target: target, pageInfo: pageInfo });
  }
}

export default CommonMemberLoginCustPwd;
