/**
 * FileName: common.logout.route.controller.ts
 * Author: Ara Jo(araara.jo@sk.com)
 * Date: 2018.07.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonLogoutRoute extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const query = req.query;
    if ( query.target.indexOf('error') !== -1 || !FormatHelper.isEmpty(query.error) ) {
      res.send(query.error_description);
    } else {
      this.loginService.logoutSession().subscribe((resp) => {
        res.redirect(query.target);
      });

    }
  }
}

export default CommonLogoutRoute;
