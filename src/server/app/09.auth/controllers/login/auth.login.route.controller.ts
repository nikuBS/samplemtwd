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
    const query = req.query;
    console.log(query);
    if ( !FormatHelper.isEmpty(query.error) ) {
      res.send(query.error_description);
    } else {
      const param = {
        target: query.params.split('=')[0],
        state: query.params.split('=')[1]
      };
      res.render('login/auth.login.route.html', param );
    }
  }
}

export default AuthLoginRoute;
