/**
 * FileName: myt-data.prepaid.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.11.14
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidAlarm extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    this.getPPSInfo().subscribe((result) => {
      res.render(
        'prepaid/myt-data.prepaid.alarm.html', Object.assign(responseData, {
          PPSInfo: result,
          convertDate: this.convertDate,
          convertAmount: this.convertAmount
        })
      );
    });
  }

  public getPPSInfo = () => this.apiService
    .request(API_CMD.BFF_05_0013, {})
    .map((res) => {
      // if ( res.code === API_CODE.CODE_00 ) {
      //   return res.result;
      // } else {
      //   return null;
      // }
      return {
        'prodAmt': '50000',
        'remained': '100',
        'obEndDt': '20190820',
        'inbEndDt': '20190830',
        'numEndDt': '20210421',
        'dataYn': 'Y',
        'dataOnlyYn': 'N'
      };
    })

  public getAutoPPSInfo = () => this.apiService
    .request(API_CMD.BFF_06_0055, {})
    .map((res) => {
      // if ( res.code === API_CODE.CODE_00 ) {
      //   return res.result;
      // } else {
      //   return null;
      // }
      return {
        amt: '10000',
        amtCd: '01',
        endDt: '20181231',
        cardNum: '****'
      };
    })

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidAlarm;
