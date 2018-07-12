/**
 * FileName: auth.login.route.controller.ts
 * Author: Ara Jo(araara.jo@sk.com)
 * Date: 2018.07.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class AuthLoginRoute extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = req.query;
    if ( !FormatHelper.isEmpty(data.error) ) {
      res.send(data.error_description);
    } else {
      res.render('login/auth.login.route.html', data );
    }
  }
}

export default AuthLoginRoute;
