/**
 * FileName: myt-data.cookiz.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class MytDataCookiz extends TwViewController {
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
      case 'complete':
        res.render('cookiz/myt-data.cookiz.complete.html', responseData);
        break;
      default:
        res.render('cookiz/myt-data.cookiz.html', responseData);
    }
  }
}

export default MytDataCookiz;
