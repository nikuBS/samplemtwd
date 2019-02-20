/**
 * FileName: common.member.line.register.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLineRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.line.register.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberLineRegister;
