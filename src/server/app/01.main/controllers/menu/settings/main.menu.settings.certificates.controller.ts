/**
 * @file main.menu.settings.certificates.ts
 * @author Hakjoon Sim
 * @since 2018-10-05
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsCertificates extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.certificates.html', { svcInfo, pageInfo });
  }
}
