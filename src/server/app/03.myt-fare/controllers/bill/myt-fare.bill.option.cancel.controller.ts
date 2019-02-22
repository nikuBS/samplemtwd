/**
 * FileName: myt-fare.bill.option.cancel.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.17
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTFareBillOptionCancel extends TwViewController {
  constructor() {
    super();
  }

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
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }
    });
  }
}

export default MyTFareBillOptionCancel;
