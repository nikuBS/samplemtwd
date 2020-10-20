/**
* @file main.menu.settings.controller.ts
* @author 김기남 (skt.P161322@partner.sk.com)
* @since 2020.09.18
* Summary: 
*/

import TwViewController from '../../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { ISvcInfo } from '../../../../../models_en/svc-info.model';
import { COOKIE_KEY } from '../../../../../types_en/common.type';

export default class MainMenuSettings extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: ISvcInfo, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('menu/settings/en.main.menu.settings.html', {
      svcInfo,
      pageInfo,
      globalCookie : req.cookies[COOKIE_KEY.GLOBAL_ENGLISH] || false // 쿠키 값을 조회한다.
    });
  }
}
