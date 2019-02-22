/**
 * FileName: myt-data.prepaid.alarm-complete.controller.ts
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_DATA_COMPLETE_MSG } from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidAlarmComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject: any = ParamsHelper.getQueryParams(req.url);
    const response = Object.assign(
      { svcInfo, pageInfo },
      queryObject
    );

    res.render('prepaid/myt-data.prepaid.alarm-complete.html', response);
  }

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidAlarmComplete;
