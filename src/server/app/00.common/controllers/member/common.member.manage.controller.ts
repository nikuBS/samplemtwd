/**
 * @file common.member.manage.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberManage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.manage.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberManage;
