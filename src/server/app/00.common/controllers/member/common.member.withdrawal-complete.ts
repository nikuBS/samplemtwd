/**
 * @file common.member.withdrawal-complete.controller.ts
 * @author Jayoon Kong
 * @since 2018.12.05
 * @desc 회원탈퇴 완료 페이지
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import ParamsHelper from '../../../../utils/params.helper';

/**
 * @class
 * @desc 회원탈퇴 완료
 */
class CommonMemberWithdrawalComplete extends TwViewController {
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
    const queryObject = ParamsHelper.getQueryParams(req.url);
    let isTid = false;
    if ( queryObject !== null ) {
      if ( queryObject['isTid'] === 'true' ) {
        isTid = true;
      }
    }

    this.loginService.sessionGenerate(req, res).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.withdrawal-complete.html', { isTid: isTid, pageInfo });
    });
  }
}

export default CommonMemberWithdrawalComplete;
