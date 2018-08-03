/**
 * FileName: myt.bill.history.micro.limit.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';


class MyTBillHistoryMicroLimit extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // this.apiService.request().subscribe()

    // return this.apiService.request().subscribe((response) => {
    // BFF_07_0073 으로 찔러야 함 : 명세 참고

    // if(response.code)
    const currentM = DateHelper.getShortDateWithFormat(new Date(), 'M');

    res.render('bill/myt.bill.history.micro.limit.html', {
      svcInfo: svcInfo,
      type: 'micro',
      currentM: currentM
    });
    // });

  }

}


export default MyTBillHistoryMicroLimit;
