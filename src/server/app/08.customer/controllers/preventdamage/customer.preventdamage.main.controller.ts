/**
 * FileName: customer.preventdamage.main.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerPreventdamageMainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('preventdamage/customer.preventdamage.main.html', {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req),
      latestWarningList: []
    });
  }
}

export default CustomerPreventdamageMainController;
