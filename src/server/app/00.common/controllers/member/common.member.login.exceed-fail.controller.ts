/**
 * @file common.member.login.exceed-fail.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.18
 * @desc 공통 > 로그인/로그아웃 > 로그인 횟수 초과
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 로그인 횟수 초과 class
 */
class CommonMemberLoginExceedFail extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 로그인 횟수 초과 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.exceed-fail.html', { svcInfo, target, pageInfo });
  }
}

export default CommonMemberLoginExceedFail;
