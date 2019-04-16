/**
 * @file 오픈소스 라이센스 표기 화면 처리
 * @author Hakjoon Sim
 * @since 2019-01-25
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
