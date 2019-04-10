/**
 * @file common.member.login.fail.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc 공통 > 로그인/로그아웃 > 로그인 실패
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 로그인 실패 class
 */
class CommonMemberLoginFail extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 로그인 실패 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param chideInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo, allSvc, chideInfo, pageInfo) {
    const errorCode = req.query.errorCode;
    res.render('member/common.member.login.fail.html', { errorCode, svcInfo, pageInfo });
  }
}

export default CommonMemberLoginFail;
