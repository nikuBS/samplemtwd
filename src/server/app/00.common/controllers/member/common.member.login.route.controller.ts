/**
 * @file common.member.login.route.controller.ts
 * @author Ara Jo(araara.jo@sk.com)
 * @since 2018.07.12
 * @desc 공통 > 로그인/로그아웃 > 로그인 처리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @desc 공통 - 로그인 처리 class
 */
class CommonMemberLoginRoute extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 로그인 처리 렌더 함수
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
    const params = this.getParams(req.query.target);
    this.logger.error('[TID login param]', params);

    if ( !FormatHelper.isEmpty(query.error) ) {
      if ( query.error === '3541' || query.error === '3602' || query.error === '4503' ) {
        params.type = 'cancel';
        res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
      } else if ( query.error === '3111' ) {
        // ID 찾기 클릭
        res.redirect('/common/tid/find-id?target=' + params.target);
      } else if ( query.error === '3112' ) {
        // 비밀번호 찾기 클릭
        res.redirect('/common/tid/change-pw?target=' + params.target);
      } else if ( query.error === '3113' ) {
        // 회원가입 클릭
        res.redirect('/common/member/signup-guide');
      } else {
        res.redirect('/common/member/login/fail?errorCode=' + query.error_description);
      }
    } else {
      res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
    }
  }

  /**
   * redirect URL 파싱
   * @param params
   */
  private getParams(params): any {
    let state = '';
    if ( params.indexOf('_state_') !== -1 ) {
      state = params.split('_state_')[1];
      params = params.split('_state_')[0];
    }

    if ( params.indexOf('_type_') !== -1 ) {
      return {
        target: params.split('_type_')[0],
        type: params.split('_type_')[1],
        state: state
      };
    } else {
      return {
        target: params,
        type: null,
        state: state
      };
    }
  }
}

export default CommonMemberLoginRoute;
