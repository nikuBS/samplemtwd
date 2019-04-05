/**
 * @file common.member.login.exceed-fail.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginExceedFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.exceed-fail.html', { svcInfo, target, pageInfo });
  }
}

export default CommonMemberLoginExceedFail;
