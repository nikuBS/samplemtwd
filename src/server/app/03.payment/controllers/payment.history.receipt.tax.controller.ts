/**
 * FileName: payment.history.receipt.tax.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';


class PaymentHistoryReceiptTaxController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    res.render('payment.history.receipt.tax.html', {});
  }

}


export default PaymentHistoryReceiptTaxController;
