/**
 * FileName: payment.prepay.micro.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {AUTO_CHARGE_CODE, PREPAY_TITLE} from '../../../types/bff-common.type';
import DateHelper from '../../../utils/date.helper';

class PaymentPrepayMicroController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('payment.prepay.micro.html', {
          prepay: this.parseData(resp.result),
          svcInfo: svcInfo,
          currentMonth: this.getCurrentMonth(),
          title: PREPAY_TITLE.MICRO
        });
      }
      res.render('payment.prepay.error.html', { err: resp, svcInfo: svcInfo, title: PREPAY_TITLE });
    });
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      if (result.autoChrgStCd === AUTO_CHARGE_CODE.USE) {
        result.autoChrgAmount = FormatHelper.addComma(result.autoChrgAmt);
        result.autoChrgStrdAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
      }
    }
    result.code = API_CODE.CODE_00;
    return result;
  }

  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth();
  }
}

export default PaymentPrepayMicroController;
