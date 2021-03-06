/**
 * @file 개인정보 처리방침 화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-04
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsPrivacy extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.privacy.html', { svcInfo, pageInfo });
  }
}
