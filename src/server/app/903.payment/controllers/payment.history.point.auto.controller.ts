/**
 * FileName: payment.history.point.auto.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';
import {MSG_STR} from '../../../types/string.old.type';


class PaymentHistoryPointAuto extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // this.apiService.request(API_CMD.BFF_07_0005, {}).subscribe((resp) => {
    //   this.logger.info(this, resp);
      this.renderView(res, 'payment.history.point.auto.html', {
        svcInfo: svcInfo,
        customerCenterTel: MSG_STR.CUSTOMER_CENTER_TEL
      });
    // });
  }

  renderView(res: Response, view: string, data: any) {

    res.render(view, data);
    // {
    //   svcInfo: svcInfo,
    //   dummyOCB: this.dummyOCB.result,
    //   dummyTpoint: this.dummyTpoint.result,
    //   dummyRainbow: this.dummyRainbow.result
    // });
  }

}

export default PaymentHistoryPointAuto;
