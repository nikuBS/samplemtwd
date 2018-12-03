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
import { Observable } from 'rxjs/Observable';
import { RECHARGE_DATA_CODE } from '../../../../types/bff.type';
import { MYT_DATA_RECHARGE_MSG } from '../../../../types/string.type';

class MyTDataPrepaidVoiceAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // if ( BrowserHelper.isApp(req) ) {
    //   this.renderPrepaidVocie(req, res, next, svcInfo);
    // } else {
    //   res.render('only.app.info.html', {
    //     svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
    //   });
    // }

    this.renderPrepaidVoiceAuto(req, res, next, svcInfo);
  }

  public renderPrepaidVoiceAuto = (req: Request, res: Response, next: NextFunction, svcInfo: any) =>     Observable.combineLatest(
    this.getPPSInfo(),
    this.getAutoPPSInfo()
  ).subscribe(([PPSInfo, AutoInfo]) => {
    if ( PPSInfo.code === API_CODE.CODE_00 ) {
      res.render('prepaid/myt-data.prepaid.voice-auto.html', {
        PPSInfo: PPSInfo.result,
        AutoInfo: this.parseAuto(AutoInfo),
        svcInfo: svcInfo,
        isApp: BrowserHelper.isApp(req),
        convertDate: this.convertDate,
        convertAmount: this.convertAmount
      });
    } else {
      this.error.render(res, {
        code: PPSInfo.code,
        msg: PPSInfo.msg,
        svcInfo: svcInfo
      });
    }
  })

  public getPPSInfo = () => this.apiService.request(API_CMD.BFF_05_0013, {});

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

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoiceAuto;
