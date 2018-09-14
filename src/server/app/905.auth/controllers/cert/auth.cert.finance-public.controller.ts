/**
 * FileName: auth.cert.finance-public.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';

class AuthCertFinancePublic extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cert/auth.cert.finance-identification.html', );
  }
}

export default AuthCertFinancePublic;
