/**
 * FileName: common.member.login.route.controller.ts
 * Author: Ara Jo(araara.jo@sk.com)
 * Date: 2018.07.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonMemberLoginRoute extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query = req.query;
    const params = this.getParams(req.query.target);

    if ( !FormatHelper.isEmpty(query.error) ) {
      if ( query.error === '3541' || query.error === '3602' || query.error === '4503' ) {
        params.type = 'cancel';
        res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
      } else {
        res.redirect('/common/member/login/fail?errorCode=' + query.error_description);
      }
    } else {
      res.render('member/common.member.login.route.html', { params, svcInfo, pageInfo });
    }
  }

  private getParams(params): any {
    if ( params.indexOf('_type_') !== -1 ) {
      return {
        target: params.split('_type_')[0],
        type: params.split('_type_')[1]
      };
    } else {
      return {
        target: params,
        type: null
      };
    }
  }
}

export default CommonMemberLoginRoute;
