/**
 * @file myt-data.prepaid.alarm.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2018.11.14
 * Description: 선불폰 충전 알람 설정 페이지
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
      svcInfo: svcInfo, // 회선 정보 (필수)
      pageInfo: pageInfo, // 페이지 정보 (필수)
      isApp: BrowserHelper.isApp(req) // 앱 여부
    };

    this.getAlarmInfo().subscribe((alarmInfo) => {
      res.render(
        'prepaid/myt-data.prepaid.alarm.html', Object.assign(responseData, {
          convertDate: this.convertDate, // 날짜 포맷에 맞게 변경
          convertAmount: this.convertAmount, // 금액 포맷에 맞게 변경
          alarmInfo: alarmInfo
        })
      );
    });
  }

  // 설정된 알람 정보 조회
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
      result.termText = PREPAID_ALARM_TYPE[result.term]; // 기간 문구
    }

    if (result.amt) {
      result.amtText = PREPAID_ALARM_AMT[result.amt]; // 금액 문구
    }

    return result;
  }

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate); // 날짜 YYYY.M.D.
  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount); // 금액에 콤마(,) 추가
}

export default MyTDataPrepaidAlarm;
