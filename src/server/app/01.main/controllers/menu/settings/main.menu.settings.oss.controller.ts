/**
 * @file main.menu.settings.oss.controller.ts
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2019.1.25
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsOss extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.oss.html', {
      svcInfo,
      pageInfo
    });
  }
}
