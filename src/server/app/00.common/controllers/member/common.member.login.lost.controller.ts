/**
 * FileName: common.member.login.lost.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginLost extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo, allSvc, chideInfo, pageInfo) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.lost.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberLoginLost;
