/**
 * FileName: common.member.withdrawal-complete.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.05
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import ParamsHelper from '../../../../utils/params.helper';

class CommonMemberWithdrawalComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    let isTid = false;
    if ( queryObject !== null ) {
      if ( queryObject['isTid'] === 'true' ) {
        isTid = true;
      }
    }

    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.withdrawal-complete.html', { isTid: isTid, pageInfo });
    });
  }
}

export default CommonMemberWithdrawalComplete;
