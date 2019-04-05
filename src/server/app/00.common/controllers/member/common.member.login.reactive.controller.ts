/**
 * @file common.login.dormancy.controller.ts
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.07.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginReactive extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target;
    res.render('member/common.member.login.reactive.html', { svcInfo: svcInfo, pageInfo: pageInfo, target: target });
  }
}

export default CommonMemberLoginReactive;
