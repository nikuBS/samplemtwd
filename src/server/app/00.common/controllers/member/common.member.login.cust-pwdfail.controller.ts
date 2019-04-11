/**
 * @file common.login.customer-pwd-fail.controller.ts
 * @author Jayoon Kong
 * @since 2018.12.04
 * @desc 고객번호 비밀번호 5회 이상 오류 안내 페이지
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 고객번호 비밀번호 5회 이상 오류 안내
 */
class CommonMemberLoginCustPwdFail extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    res.render('member/common.member.login.cust-pwdfail.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default CommonMemberLoginCustPwdFail;
