/**
 * FileName: myt-data.gift.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.10
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class MytDataGift extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch ( page ) {
      case 'sms':
        res.render('gift/myt-data.gift.sms.html', responseData);
        break;
      case 'complete':
        res.render('gift/myt-data.gift.complete.html', responseData);
        break;
      default:
        res.render('gift/myt-data.gift.html', responseData);
    }
  }
}

export default MytDataGift;
