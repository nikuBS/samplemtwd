/**
 * @file myt-fare.bill.option.cancel.controller.ts
 * @author Jayoon Kong
 * @since 2018.12.17
 * @desc 자동납부 해지 page
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

/**
 * @class
 * @desc 자동납부 해지
 */
class MyTFareBillOptionCancel extends TwViewController {
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
    this.apiService.request(API_CMD.BFF_07_0060, {}).subscribe((paymentOption) => {
      if (paymentOption.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.option.cancel.html', {
          paymentOption: paymentOption.result,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: paymentOption.code,
          msg: paymentOption.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }
}

export default MyTFareBillOptionCancel;
