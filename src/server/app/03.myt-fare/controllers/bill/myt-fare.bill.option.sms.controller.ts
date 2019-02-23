/**
 * FileName: myt-fare.bill.option.sms.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.17
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTFareBillOptionSms extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('bill/myt-fare.bill.option.sms.html', { pageInfo });
  }
}

export default MyTFareBillOptionSms;
