/**
 * FileName: myt-data.prepaid.voice.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.11.14
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidVoice extends TwViewController {
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
    this.renderPrepaidVoice(req, res, next, svcInfo);
  }

  public renderPrepaidVoice = (req: Request, res: Response, next: NextFunction, svcInfo: any) => this.getPPSInfo().subscribe((resp) => {
    if ( resp.code === API_CODE.CODE_00 ) {
      const result = resp.result;
      res.render('prepaid/myt-data.prepaid.voice.html', {
        PPSInfo: result,
        svcInfo: svcInfo,
        isApp: BrowserHelper.isApp(req),
        convertDate: this.convertDate,
        convertAmount: this.convertAmount
      });
    } else {
      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
    }
  }, (err) => {
    this.error.render(res, { code: err.code, msg: err.msg, svcInfo });
  })

  public getPPSInfo = () => this.apiService.request(API_CMD.BFF_05_0013, {});

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoice;
