/**
 * FileName: common.login.exceed-fail.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonLoginExceedFail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('login/common.login.exceed-fail.html', { svcInfo });
  }
}

export default CommonLoginExceedFail;
