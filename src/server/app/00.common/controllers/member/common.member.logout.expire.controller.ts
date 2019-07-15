/**
 * @file common.member.logout.expire.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc 공통 > 로그인/로그아웃 > 세션만료
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { COOKIE_KEY } from '../../../../types/common.type';

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
    const sessInvalid = req.query.sess_invalid || '';

    // Session 뒤바뀜 방어로직 추가(Sensing)
    if (!FormatHelper.isEmpty(sessInvalid)) {
      this.processInvalidSession(req, res);
    }

    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.logout.expire.html', { svcInfo, pageInfo, target });
    });
  }

  /***
   * 로그 출력
   * @param req
   */
  private processInvalidSession(req: any, res: any) {
    this.loginService.sessionGenerate(req);
    this.loginService.setCookie(res, COOKIE_KEY.TWM_LOGIN, '');
    this.logger.error(this, '[Invalid Session(Change Sessiokn)] ', req.headers, req.session);
  }
}

export default CommonMemberLogoutExpire;
