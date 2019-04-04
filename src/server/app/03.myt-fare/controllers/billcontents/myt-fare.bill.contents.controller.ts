/**
 * @file myt-fare.bill.contents.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.08
 * Description: 콘텐츠이용료 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';
import {PREPAY_ERR_MSG} from '../../../../types/string.type';

class MyTFareBillContents extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('billcontents/myt-fare.bill.contents.html', {
      svcInfo: svcInfo, // 회선 정보 (필수)
      pageInfo: pageInfo, // 페이지 정보 (필수)
      currentMonth: this.getCurrentMonth() // 현재월 조회
    });
  }

  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth(); // 현재월 조회
  }
}

export default MyTFareBillContents;
