/**
 * FileName: payment.prepay.contents.history.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {AUTO_CHARGE_CODE} from '../../../types/bff-common.type';

class PaymentPrepayContentsHistoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0078, {}).subscribe((resp) => {
      res.render('payment.prepay.micro.history.html', {
        useContentsPrepayRecord: this.getResult(resp),
        svcInfo: svcInfo
      });
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result.useContentsPrepayRecord);
    }
    return resp;
  }

  private parseData(record: any): any {
    if (!FormatHelper.isEmpty(record)) {
      record.map((data) => {
        data.amount = FormatHelper.addComma(data.chrgAmt);
      });
    }
    record.code = API_CODE.CODE_00;
    return record;
  }
}

export default PaymentPrepayContentsHistoryController;
