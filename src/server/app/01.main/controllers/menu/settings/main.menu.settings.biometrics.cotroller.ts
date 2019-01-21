/**
 * FileName: common.biometrics.menu.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.09
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { FIDO_TYPE } from '../../../../../types/common.type';

export default class MainMenuSettingsBiometrics extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target;

    res.render('menu/settings/main.menu.settings.biometrics.html', { svcInfo, target, pageInfo });
  }
}
