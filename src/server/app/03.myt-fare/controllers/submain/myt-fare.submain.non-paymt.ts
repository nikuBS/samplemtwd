/*
 * FileName: myt-fare.payment.over.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.01
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTFarePaymentOver extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    // 미납요금
    res.render('payment/myt-fare.payment.over.html');
  }
}

export default MyTFarePaymentOver;
