/**
 * FileName: myt-join.wire.discount-refund.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';


class MyTJoinWireDiscountRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // svcMgmtNum
    this.apiService.request(API_CMD.BFF_05_0158, {})
      .subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const option = { svcInfo: svcInfo, reqDate: DateHelper.getShortDateNoDot( resp.result.reqDate ) };
          res.render('wire/myt-join.wire.discount-refund.html', option);
        }
      });
  }
}

export default MyTJoinWireDiscountRefund;

