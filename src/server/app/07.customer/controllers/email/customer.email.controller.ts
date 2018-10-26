/**
 * FileName: customer.email.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerEmail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, pageInfo?: any): void {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch ( page ) {
      case 'complete':
        res.render('email/customer.email.complete.html', responseData);
        break;
      default:
        // Observable.combineLatest(
        // ).subscribe(([subscriptions]) => {
        //
        // });
        res.render('email/customer.email.html', responseData);
    }
  }
}

export default CustomerEmail;
