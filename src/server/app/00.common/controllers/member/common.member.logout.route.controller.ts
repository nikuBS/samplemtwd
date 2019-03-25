/**
 * FileName: common.member.logout.route.controller.ts
 * Author: Ara Jo(araara.jo@sk.com)
 * Date: 2018.07.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonMemberLogoutRoute extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query = req.query;
    if ( !FormatHelper.isEmpty(query.error) ) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        code: query.error,
        msg: query.error_description,
      });
    } else {
      res.redirect(query.target);
    }
  }
}

export default CommonMemberLogoutRoute;
