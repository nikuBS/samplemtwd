/**
 * FileName: myt.bill.history.limit.common.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import DateHelper from '../../../../utils/date.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';

class MyTBillHistoryMicroLimit extends TwViewController {

  private view: any;

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const paths = req.path.split('/');
        const current = paths[paths.length - 2];

        switch (current) {
          case 'micro':
            this.view = 'bill/myt.bill.history.micro.limit.html';
            break;
          case 'contents' :
            this.view = 'bill/myt.bill.history.contents.limit.html';
            break;
          default:
            break;
        }

        const currentM = DateHelper.getShortDateWithFormat(new Date(), 'M');

        res.render(this.view, {
          svcInfo: svcInfo,
          type: current,
          currentM: currentM
        });
      } else {

        res.render('../../../03.payment/views/containers/payment.prepay.error.html', {
          err: resp,
          svcInfo: svcInfo,
          title: MYT_PAY_HISTORY_TITL.MICRO
        });
      }
    });

  }

}


export default MyTBillHistoryMicroLimit;
