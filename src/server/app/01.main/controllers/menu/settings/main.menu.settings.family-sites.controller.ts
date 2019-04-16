/**
 * @file 패밀리 사이트 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-26
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsFamilySites extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/main.menu.settings.family-sites.html', {
      svcInfo,
      pageInfo
    });
  }
}
