/**
 * @file common.member.login.fail.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo, allSvc, chideInfo, pageInfo) {
    const errorCode = req.query.errorCode;
    res.render('member/common.member.login.fail.html', { errorCode, svcInfo, pageInfo });
  }
}

export default CommonMemberLoginFail;
