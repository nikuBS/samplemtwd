/**
 * @file common.member.logout.expire.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLogoutExpire extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.logout.expire.html', { svcInfo, pageInfo, target });
    });
  }
}

export default CommonMemberLogoutExpire;
