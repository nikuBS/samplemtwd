/**
 * @file myt-data.prepaid.voice-info.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2019.02.20
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidVoiceInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( BrowserHelper.isApp(req) ) {
      this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo: pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }

    // this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
  }

  public renderPrepaidVoice = (req: Request, res: Response, next: NextFunction, svcInfo, pageInfo) =>
    res.render('prepaid/myt-data.prepaid.voice.info.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req)
    });

  public convertDate = (sDate) => DateHelper.getShortDate(sDate);
}

export default MyTDataPrepaidVoiceInfo;
