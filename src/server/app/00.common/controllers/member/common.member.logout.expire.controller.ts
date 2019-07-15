/**
 * @file common.member.logout.expire.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc 공통 > 로그인/로그아웃 > 세션만료
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 세션만료 class
 */
class CommonMemberLogoutExpire extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 세션만표 화면 렌더 함수
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
    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.logout.expire.html', { svcInfo, pageInfo, target });
    });
  }
}

export default CommonMemberLogoutExpire;
