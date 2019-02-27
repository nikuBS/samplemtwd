/**
 * FileName: myt-data.prepaid.voice-auto.controller.ts
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidVoiceAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( BrowserHelper.isApp(req) ) {
      this.renderPrepaidVoiceAuto(req, res, next, svcInfo, pageInfo);
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }

    // this.renderPrepaidVoiceAuto(req, res, next, svcInfo, pageInfo);
  }

  public renderPrepaidVoiceAuto = (req: Request, res: Response, next: NextFunction, svcInfo, pageInfo) =>
    this.getAutoPPSInfo().subscribe((AutoInfo) => {
    if ( AutoInfo.code === API_CODE.CODE_00 ) {
      res.render('prepaid/myt-data.prepaid.voice-auto.html', {
        AutoInfo: this.parseAuto(AutoInfo),
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        convertAmount: this.convertAmount,
        convertDashDate: this.convertDashDate
      });
    } else {
      this.error.render(res, {
        code: AutoInfo.code,
        msg: AutoInfo.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }
  })

  public getAutoPPSInfo = () => this.apiService.request(API_CMD.BFF_06_0055, {});

  private parseAuto(AutoInfo: any): any {
    let result: any;

    if ( !FormatHelper.isEmpty(AutoInfo.result) ) {
      result = AutoInfo.result;
    } else {
      return null;
    }

    return result;
  }

  public convertDashDate = (sDate) => DateHelper.getDashShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoiceAuto;
