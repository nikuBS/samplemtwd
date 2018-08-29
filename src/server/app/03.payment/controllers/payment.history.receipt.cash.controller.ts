/**
 * FileName: payment.history.receipt.cash.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';


class PaymentHistoryReceiptCash extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    res.render('payment.history.receipt.cash.html', {
      svcInfo: svcInfo
    });
  }

}


export default PaymentHistoryReceiptCash;
