/**
 * FileName: common.login.dormancy.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginReactive extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('member/common.member.login.reactive.html', { svcInfo: svcInfo });
  }
}

export default CommonMemberLoginReactive;
