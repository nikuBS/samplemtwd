/**
 * @file common.member.line.empty.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLineEmpty extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.line.empty.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberLineEmpty;
