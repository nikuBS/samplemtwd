/**
 * @file myt-fare.bill.small.prepay.controller.ts
 * @author 양정규
 * @since 2019.06.26
 * @desc 소액결제 > 선결제 화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

/**
 * @class
 * @desc 소액결제 > 선결제 화면
 */
class MyTFareBillSmallPrepay extends TwViewController {
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
    res.render('billsmall/myt-fare.bill.small.prepay.html', {
      pageInfo,
      svcInfo
    });
  }
}

export default MyTFareBillSmallPrepay;
