/**
 * @file common.member.slogin.fail.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > 간편로그인 이용불가
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * 공통 - 간편로그인 이용불가 class
 */
class CommonMemberSloginFail extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 간편로그인 이용불가 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.slogin.fail.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberSloginFail;
