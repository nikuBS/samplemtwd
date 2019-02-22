/**
 * FileName: common.member.init.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberInit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.init.html', { svcInfo, pageInfo });
    });
  }
}

export default CommonMemberInit;
