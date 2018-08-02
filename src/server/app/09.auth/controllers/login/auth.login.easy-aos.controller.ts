/**
 * FileName: auth.login.easy-aos.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class AuthLoginEasyAos extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res:
    Response, next: NextFunction, svcInfo: any) {
    const query = req.query;
    const mdn = {
      original: query.mdn,
      show: FormatHelper.conTelFormatWithDash(query.mdn)
    };

    res.render('login/auth.login.easy-aos.html', { svcInfo, mdn });
  }
}

export default AuthLoginEasyAos;
