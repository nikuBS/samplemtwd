/**
 * FileName: payment.prepay.micro.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {AUTO_CHARGE_CODE} from '../../../types/bff-common.type';

class PaymentPrepayMicroController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      res.render('payment.prepay.micro.html', {
        prepay: this.getResult(resp),
        svcInfo: svcInfo
      });
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      if (resp.result.autoChrgStCd === AUTO_CHARGE_CODE.USE) {
        return this.parseData(resp.result);
      }
      return null;
    }
    return resp;
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChrgAmount = FormatHelper.addComma(result.autoChrgAmt);
      result.autoChrgStrdAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
    }
    result.code = API_CODE.CODE_00;
    return result;
  }
}

export default PaymentPrepayMicroController;
