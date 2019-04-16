/**
 * @file common.tid.guide.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc Common > TID > 안내
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import EnvHelper from '../../../../utils/env.helper';

/**
 * @desc TID 안내 페이지 요청
 */
class CommonTidGuide extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > TID > 안내 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const tidServer = EnvHelper.getEnvironment('TID_SERVER');
    if (process.env.NODE_ENV === 'prd') {
      res.redirect(tidServer + '/auth/type/view/guide.do');
    } else {
      res.redirect(tidServer + '/auth/type/view/guide.do');
    }
  }
}

export default CommonTidGuide;
