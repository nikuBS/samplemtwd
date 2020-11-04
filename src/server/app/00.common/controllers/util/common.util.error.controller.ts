/**
 * @file common.util.error.controller.ts
 * @author Jihun Yang (jihun202@sk.com)
 * @since 2018.08.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class CommonError extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const code = req.query.code || '',
      msg = req.query.msg || '',
      subMsg = req.query.subMsg || '',
      // 20.4.7 양정규 : query가 String으로 오기때문에 isPopupCheck 를 String값으로 비교하는걸로 바꿔줌.
      // undefined type error incompatible
      isPopupCheck = (req.query.isPopupCheck && req.query.isPopupCheck === 'true') || false;

    this.error.render(res, {
      code: code,
      msg: msg,
      subMsg: subMsg,
      pageInfo: pageInfo,
      svcInfo: svcInfo,
      isPopupCheck: isPopupCheck
    });
  }
}

export default CommonError;
