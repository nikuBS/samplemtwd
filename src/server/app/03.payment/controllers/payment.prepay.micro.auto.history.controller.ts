/**
 * FileName: payment.prepay.micro.auto.history.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';

class PaymentPrepayMicroAutoHistoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0075, {}).subscribe((resp) => {
      res.render('payment.prepay.micro.auto.history.html', {
        autoPrepay: this.getResult(resp),
        svcInfo: svcInfo
      });
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result);
    }
    return resp;
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.date = DateHelper.getFullDateAndTime(result.oper_dtm);
      result.autoChrgStrdAmount = FormatHelper.addComma(result.auto_chrg_strd_amt);
      result.autoChrgAmount = FormatHelper.addComma(result.auto_chrg_amt);
    }
    result.code = API_CODE.CODE_00;
    return result;
  }
}

export default PaymentPrepayMicroAutoHistoryController;
