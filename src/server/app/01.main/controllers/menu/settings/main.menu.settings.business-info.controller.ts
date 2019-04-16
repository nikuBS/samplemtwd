/**
 * @file 사업자 정보 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-05
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../../utils/browser.helper';

export default class MainMenuSettingsBusinessInfo extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.business-info.html', {
      svcInfo,
      pageInfo,
      isApp: BrowserHelper.isApp(req)
    });
  }
}
