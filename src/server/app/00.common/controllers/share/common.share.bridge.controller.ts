/**
 * @file common.share.bridge.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.20
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonShareBridge extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target;
    const loginType = req.query.loginType;

    res.render('share/common.share.bridge.html', { isAndroid: BrowserHelper.isAndroid(req), target, loginType, pageInfo });
  }
}
export default CommonShareBridge;
