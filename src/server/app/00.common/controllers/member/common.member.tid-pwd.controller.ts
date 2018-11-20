/**
 * FileName: common.member.tid-pwd.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberTidPwd extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.tid-pwd.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default CommonMemberTidPwd;
