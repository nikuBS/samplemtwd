/**
 * @file Tplace 매장 보기 관련 처리
 * @author junho kwon (yamanin1@partner.sk.com)
 * @since 2019-5-22
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';

export default class MainMenuSettingsTplaces extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
          res.render('menu/settings/main.menu.settings.tplaces.html', {
            svcInfo,
            pageInfo});
  }
}
