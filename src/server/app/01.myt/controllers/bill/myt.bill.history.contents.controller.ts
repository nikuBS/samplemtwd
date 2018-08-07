/**
 * FileName: myt.bill.history.contents.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';

class MyTBillHistoryContentsController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const endMDD = DateHelper.getShortDateWithFormat(new Date(), 'M.DD');
        const startMDD = endMDD.replace(endMDD.substr(-2), '') + '01';

        // if(response.code)
        res.render('bill/myt.bill.history.contents.html', {
          svcInfo: svcInfo,
          startMDD: startMDD,
          endMDD: endMDD
        });
      } else {
        res.render('../../../03.payment/views/containers/payment.prepay.error.html', {
          err: resp,
          svcInfo: svcInfo,
          title: MYT_PAY_HISTORY_TITL.CONTENTS
        });
      }
    });
    // return this.apiService.request().subscribe((response) => {


    // });

  }

}


export default MyTBillHistoryContentsController;
