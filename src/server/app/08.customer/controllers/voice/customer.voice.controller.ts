/**
 * FileName: customer.voice.controller.ts
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.24
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerVoice extends TwViewController {
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
      case 'info':
        res.render('voice/customer.voice.info.html', responseData);
        break;
      case 'register':
        res.render('voice/customer.voice.register.html', responseData);
        break;
      case 'complete':
        res.render('voice/customer.voice.complete.html',
          Object.assign(
            responseData,
            { targetNum: FormatHelper.conTelFormatWithDash(req.query.targetNum) }
          ));
        break;
      default:
        // Observable.combineLatest(
        // ).subscribe(([subscriptions]) => {
        //
        // });
        res.render('voice/customer.voice.html', responseData);
    }
  }
}

export default CustomerVoice;
