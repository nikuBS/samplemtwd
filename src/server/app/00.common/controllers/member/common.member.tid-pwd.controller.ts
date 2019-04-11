/**
 * @file common.member.tid-pwd.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.31
 * @desc TID-Password 찾기 페이지
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc TID-Password 찾기
 */
class CommonMemberTidPwd extends TwViewController {
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
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.tid-pwd.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default CommonMemberTidPwd;
