/**
 * FileName: common.member.management.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberManagement extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('member/common.member.management.html', { svcInfo });
  }
}

export default CommonMemberManagement;
