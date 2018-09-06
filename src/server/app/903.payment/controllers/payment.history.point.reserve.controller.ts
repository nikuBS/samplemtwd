/**
 * FileName: payment.history.point.reserve.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';
import {MSG_STR} from '../../../types/string.type';


class PaymentHistoryPointReserve extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.renderView(res, 'payment.history.point.reserve.html', {
      svcInfo: svcInfo,
      customerCenterTel: MSG_STR.CUSTOMER_CENTER_TEL
    });
  }

  renderView(res: Response, view: string, data: any) {
    res.render(view, data);
  }

}


export default PaymentHistoryPointReserve;
