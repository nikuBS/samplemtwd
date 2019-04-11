/**
 * @file myt-data.prepaid.alarm-complete.controller.ts
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.28
 * @desc: 선불폰 충전 알람 설정 완료 페이지
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import ParamsHelper from '../../../../utils/params.helper';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 * @desc 선불폰 알람 설정 완료
 */
class MyTDataPrepaidAlarmComplete extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject: any = ParamsHelper.getQueryParams(req.url);
    const response = Object.assign(
      { svcInfo, pageInfo },
      queryObject
    );

    res.render('prepaid/myt-data.prepaid.alarm-complete.html', response);
  }

  /**
   * @function
   * @desc convert format from YYYYMMDD to YYYY.M.D.
   * @param sDate
   * @returns {string}
   */
  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  /**
   * @function
   * @desc convert format from 00000 to 00,000
   * @param sAmount
   * @returns {string}
   */
  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidAlarmComplete;
