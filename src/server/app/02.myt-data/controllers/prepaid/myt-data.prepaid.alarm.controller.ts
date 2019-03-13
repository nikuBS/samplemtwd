/**
 * FileName: myt-data.prepaid.alarm.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.11.14
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {PREPAID_ALARM_AMT, PREPAID_ALARM_TYPE} from '../../../../types/bff.type';

class MyTDataPrepaidAlarm extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req)
    };

    this.getAlarmInfo().subscribe((alarmInfo) => {
      res.render(
        'prepaid/myt-data.prepaid.alarm.html', Object.assign(responseData, {
          convertDate: this.convertDate,
          convertAmount: this.convertAmount,
          alarmInfo: alarmInfo
        })
      );
    });
  }

  public getAlarmInfo = () => this.apiService.request(API_CMD.BFF_06_0075, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return this.parseInfo(res.result);
      } else {
        return null;
      }
    })

  public parseInfo = (result) => {
    if (result.term) {
      result.termText = PREPAID_ALARM_TYPE[result.term];
    }

    if (result.amt) {
      result.amtText = PREPAID_ALARM_AMT[result.amt];
    }

    return result;
  }

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);
  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidAlarm;
