/**
 * @file myt-fare.bill.option.sms.controller.ts
 * @author Jayoon Kong
 * @since 2018.12.17
 * @desc 자동납부 해지 후 문자 알림서비스 신청 page
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 자동납부 해지 후 문자 알림서비스 신청
 */
class MyTFareBillOptionSms extends TwViewController {
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
    res.render('bill/myt-fare.bill.option.sms.html', { svcInfo, pageInfo });
  }
}

export default MyTFareBillOptionSms;
