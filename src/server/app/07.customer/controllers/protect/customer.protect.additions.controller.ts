/**
 * FileName: customer.protect.additions.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerProtectAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('protect/customer.protect.additions.html', {
      svcInfo: svcInfo
    });
  }
}

export default CustomerProtectAdditions;
