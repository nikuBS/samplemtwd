/**
 * @file common.member.init.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @desc 공통 - Native Session 전달
 */
class CommonMemberInit extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Native Session 전달 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.loginService.sessionGenerate(req, res).subscribe(() => {
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
