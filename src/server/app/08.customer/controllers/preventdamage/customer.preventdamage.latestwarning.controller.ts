/**
 * FileName: customer.preventdamage.latestwarning.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.26
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerPreventdamageLatestwarningController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('preventdamage/customer.preventdamage.latestwarning.html', {
      svcInfo: svcInfo
    });
  }
}

export default CustomerPreventdamageLatestwarningController;
