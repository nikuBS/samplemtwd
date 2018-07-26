/**
 * FileName: payment.prepay.micro.history.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';
import prepayMicroHistory from '../../../mock/server/payment/payment.prepay.micro.history';

class PaymentPrepayMicroHistoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0071, {}).subscribe((resp) => {
      res.render('payment.prepay.micro.history.html', {
        microPrepayRecord: this.getResult(prepayMicroHistory),
        svcInfo: svcInfo
      });
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result.microPrepayRecord);
    }
    return resp;
  }

  private parseData(record: any): any {
    if (!FormatHelper.isEmpty(record)) {
      record.map((data) => {
        data.date = DateHelper.getShortDateNoDot(data.opDt);
        data.amount = FormatHelper.addComma(data.chrgAmt);
      });
    }
    record.code = API_CODE.CODE_00;
    return record;
  }
}

export default PaymentPrepayMicroHistoryController;
