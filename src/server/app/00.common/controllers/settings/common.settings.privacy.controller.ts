/**
 * FileName: common.settings.privacy.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.04
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class CommonSettingsPrivacy extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('settings/common.settings.privacy.html', { svcInfo: svcInfo });
  }
}
