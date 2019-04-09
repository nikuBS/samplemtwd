/**
 * @file common.member.logout.route.controller.ts
 * @author Ara Jo(araara.jo@sk.com)
 * @since 2018.07.18
 * @desc 공통 > 로그인/로그아웃 > 로그아웃 처리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @desc 공통 - 로그아웃 처리 class
 */
class CommonMemberLogoutRoute extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 로그아웃 처리 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query = req.query;
    if ( !FormatHelper.isEmpty(query.error) ) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        code: query.error,
        msg: query.error_description,
      });
    } else {
      res.redirect(query.target);
    }
  }
}

export default CommonMemberLogoutRoute;
