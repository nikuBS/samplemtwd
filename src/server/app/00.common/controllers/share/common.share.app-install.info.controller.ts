/**
 * FileName: common.share.app-install.info.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonShareAppInstallInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('share/common.share.app-install.info.html', { isAndroid: BrowserHelper.isAndroid(req) });

  }
}
export default CommonShareAppInstallInfo;
