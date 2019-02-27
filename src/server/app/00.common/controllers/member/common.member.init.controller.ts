/**
 * FileName: common.member.init.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonMemberInit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      const type = {
        android: BrowserHelper.isApp(req) && BrowserHelper.isAndroid(req) ? 'Y' : 'N',
        ios: BrowserHelper.isApp(req) && BrowserHelper.isIos(req) ? 'Y' : 'N'
      };
      res.render('member/common.member.init.html', { svcInfo, pageInfo, type });
    });
  }
}

export default CommonMemberInit;
