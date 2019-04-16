/**
 * @file common.util.error.controller.ts
 * @author 7Ara Jo (araara.jo@sk.com)
 * @since 2019.03.2
 * @desc Common > Util > 에러 > Inapp 에러 화면
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

/**
 * @desc Inapp 브라우저 에러 화면 초기화를 위한 class
 */
class CommonInappError extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > Util > 에러 > Inapp 에러 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const code = req.query.code || '';
    const msg = req.query.msg || '';

    res.render('util/common.util.inapp-error.html', { pageInfo, svcInfo, code, msg });
  }
}

export default CommonInappError;
