/**
 * FileName: common.util.error.controller.ts
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.08.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class CommonError extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const code = req.query.code || '',
      msg = req.query.msg || '';

    this.error.render(res, {
      code: code,
      msg: msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default CommonError;
