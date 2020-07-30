/**
 * @file myt-fare.bill.sms-guide.controller.ts
 * @author Kim In Hwan
 * @editor 양정규
 * @since 2020.07.28
 * @desc 입금 전용계좌 신청안내
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

/**
 * @class
 * @desc 입금 전용계좌 신청안내방법
 */
class MyTFareBillSmsGuide extends TwViewController {

  /**
   * render
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('bill/myt-fare.bill.sms-guide.html', { pageInfo, svcInfo });
  }
}

export default MyTFareBillSmsGuide;
