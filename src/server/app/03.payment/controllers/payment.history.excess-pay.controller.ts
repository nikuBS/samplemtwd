/**
 * FileName: payment.history.excess-pay.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';


class PaymentHistoryExcessPayController extends TwViewController {

  constructor() {
    super();
  }

  renderView(res: Response, view: string, data: any) {
    res.render(view, data);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resp) => {

      // console.log(resp);

      this.renderView(res, 'payment.history.excess-pay.html', {
        svcInfo: svcInfo
      });
  }

}


export default PaymentHistoryExcessPayController;
