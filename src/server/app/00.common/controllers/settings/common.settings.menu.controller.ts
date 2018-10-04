/**
 * FileName: common.settings.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

export default class CommonSettingsMenu extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('settings/common.settings.menu.html', {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req),
      isLogin: this.isLogin(svcInfo)
    });
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }
}
