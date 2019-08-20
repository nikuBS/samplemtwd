/**
 * @file common.member.logout.complete.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc 공통 > 로그인/로그아웃 > 로그아웃 완료
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 로그아웃 완료 class
 */
class CommonMemberLogoutComplete extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 로그아웃 완료 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.loginService.sessionGenerate(req, res).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.logout.complete.html', { svcInfo, pageInfo });
    });
  }
}

export default CommonMemberLogoutComplete;
