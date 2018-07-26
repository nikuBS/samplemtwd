/**
 * FileName: myt.bill.history.micro.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';


class MyTBillHistoryMicro extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // return this.apiService.request().subscribe((response) => {

    // if(response.code)
    res.render('bill/myt.bill.history.micro.html', {
      svcInfo: svcInfo
    });
    // });

  }

}


export default MyTBillHistoryMicro;
