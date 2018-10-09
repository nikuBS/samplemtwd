/**
 * FileName: common.biometrics.menu.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.09
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { FIDO_TYPE } from '../../../../types/common.type';

export default class CommonBiometricsMenu extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const target = FIDO_TYPE[req.query.target];
    res.render('biometrics/biometrics.menu.html', { svcInfo, target });
  }
}
