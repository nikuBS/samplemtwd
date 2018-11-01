/**
 * FileName: common.line.empty-register.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonLineEmptyRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('line/common.line.empty-register.html', { svcInfo });
  }
}

export default CommonLineEmptyRegister;
