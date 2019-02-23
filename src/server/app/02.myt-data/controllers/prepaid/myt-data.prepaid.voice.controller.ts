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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( BrowserHelper.isApp(req) ) {
      this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }

    // this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
  }

  public renderPrepaidVoice = (req: Request, res: Response, next: NextFunction, svcInfo, pageInfo) =>
    this.getPPSInfo()
      .subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          res.render('prepaid/myt-data.prepaid.voice.html', {
            PPSInfo: result,
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            isApp: BrowserHelper.isApp(req),
            convertDate: this.convertDate,
            convertAmount: this.convertAmount
          });
        } else {
          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (err) => {
        this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
      })

  public getPPSInfo = () => this.apiService.request(API_CMD.BFF_05_0013, {});

  public convertDate = (sDate) => DateHelper.getShortDate(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoice;
