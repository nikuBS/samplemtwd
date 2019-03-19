/**
 * FileName: common.auto-sms.cert.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CommonAutoSmsCert extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    res.render('auto-sms/common.auto-sms.cert.html', { pageInfo });
  }
}

export default CommonAutoSmsCert;
