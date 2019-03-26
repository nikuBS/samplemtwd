/**
 * FileName: main.menu.settings.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import { ISvcInfo } from '../../../../../models/svc-info.model';

export default class MainMenuSettings extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: ISvcInfo,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.html', {
      svcInfo,
      pageInfo,
      isApp: BrowserHelper.isApp(req),
      isLogin: this.isLogin(svcInfo),
      isRegularMember: !!svcInfo && parseInt(svcInfo.expsSvcCnt, 10) > 0
    });
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }
}
