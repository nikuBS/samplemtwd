/**
 * @file common.share.app-install.info.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.12.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonShareAppInstallInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction,  svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('share/common.share.app-install.info.html', { isAndroid: BrowserHelper.isAndroid(req), pageInfo });

  }
}
export default CommonShareAppInstallInfo;
