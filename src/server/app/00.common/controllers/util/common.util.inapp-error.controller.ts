/**
 * FileName: common.util.error.controller.ts
 * Author: 7Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.2
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CommonInappError extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const code = req.query.code || '';
    const msg = req.query.msg || '';

    res.render('util/common.util.inapp-error.html', { pageInfo, svcInfo, code, msg });
  }
}

export default CommonInappError;
