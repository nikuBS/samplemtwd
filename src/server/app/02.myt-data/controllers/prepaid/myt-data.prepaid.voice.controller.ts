/**
 * FileName: myt-data.prepaid.voice.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.11.14
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTDataPrepaidVoice extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( BrowserHelper.isApp(req) ) {
      res.render('prepaid/myt-data.prepaid.voice.html', {
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }

    // this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
  }
}

export default MyTDataPrepaidVoice;
