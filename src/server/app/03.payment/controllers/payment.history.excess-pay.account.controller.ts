/**
 * FileName: payment.history.excess-pay.account.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';


class PaymentHistoryExcessPayAccountController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    res.render('payment.history.excess-pay.account.html', {
      svcInfo: svcInfo
    });
  }

}


export default PaymentHistoryExcessPayAccountController;
