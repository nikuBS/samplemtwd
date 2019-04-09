/**
 * @file common.member.login.lost.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.27
 * @desc 공통 > 로그인/로그아웃 > 분실/정지 안내
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 분실/정지 안내 class
 */
class CommonMemberLoginLost extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 분실/정지 안내 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param chideInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo, allSvc, chideInfo, pageInfo) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.lost.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberLoginLost;
