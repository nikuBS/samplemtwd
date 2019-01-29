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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const query = req.query;
    if ( !FormatHelper.isEmpty(query.error) ) {
      res.send(query.error_description);
    } else {
      res.render('member/common.member.login.route.html', this.getParams(query.target));
    }
  }

  private getParams(params): any {
    if ( params.indexOf('_state_') !== -1 ) {
      return {
        target: params.split('_state_')[0],
        state: params.split('_state_')[1]
      };
    } else {
      return {
        target: params,
        state: null
      };
    }
  }
}

export default CommonMemberLoginRoute;
