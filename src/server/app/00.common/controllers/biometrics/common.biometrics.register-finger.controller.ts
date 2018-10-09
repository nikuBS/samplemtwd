/**
 * FileName: common.biometrics.register-finger.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.09
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class CommonBiometricsRegisterFinger extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('biometrics/biometrics.register-finger.html', { svcInfo: svcInfo });
  }
}
