/**
 * FileName: main.menu.settings.business-info.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.05
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsBusinessInfo extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.business-info.html', { svcInfo, pageInfo });
  }
}
