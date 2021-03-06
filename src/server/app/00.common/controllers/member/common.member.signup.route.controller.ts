/**
 * @file common.member.signup.route.controller.ts
 * @author Ara Jo(araara.jo@sk.com)
 * @since 2018.07.12
 * @desc 공통 > 로그인/로그아웃 > 회원가입 처리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @desc 공통 - 회원가입 처리 class
 */
class CommonMemberSignupRoute extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 회원가입 처리 렌더 함수
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
    const params = {
      type: '',
      target: '/main/home'
    };

    if ( !FormatHelper.isEmpty(query.error) ) {
      if ( query.error === '3541' ) {
        params.type = 'cancel';
        params.target = '/common/member/signup-guide';
        res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
      } else {
        res.redirect('/common/member/login/fail?errorCode=' + query.error_description);
      }
    } else {
      res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
    }
  }
}

export default CommonMemberSignupRoute;
