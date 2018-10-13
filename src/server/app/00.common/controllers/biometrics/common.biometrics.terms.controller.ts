/**
 * FileName: common.biometrics.terms.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.09
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { FIDO_TYPE } from '../../../../types/common.type';

export default class CommonBiometricsTerms extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const target = req.query.target;
    res.render('biometrics/common.biometrics.terms.html', { svcInfo, target });
  }
}
