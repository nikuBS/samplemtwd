/**
 * FileName: myt-fare.payment.auto.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {PAYMENT_OPTION} from '../../../../types/bff.old.type';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_NAME} from '../../../../types/bff.type';

class MyTFarePaymentAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    Observable.combineLatest(
      this.getPaymentOption()
    ).subscribe(([paymentOption]) => {
      if (paymentOption.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.auto.html', {
          svcInfo: svcInfo,
          paymentOption: this.parseData(paymentOption.result)
        });
      } else {
        this.error.render(res, {
          code: paymentOption.code,
          msg: paymentOption.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getPaymentOption(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  private parseData(result): any {
    result.payCode = '1';
    result.payDate = '11';

    if (result.payMthdCd === PAYMENT_OPTION.BANK || result.payMthdCd === PAYMENT_OPTION.CARD) {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_CHANGE;
      result.buttonName = MYT_FARE_PAYMENT_NAME.CHANGE;
      result.type = 'change';
      result.isAuto = true;

      if (result.payMthdCd === PAYMENT_OPTION.CARD && result.payCyclNm !== undefined) {
        result.payCode = result.payCyclCd;
        result.payDate = result.payCyclNm;
      }
    } else {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_NEW;
      result.buttonName = MYT_FARE_PAYMENT_NAME.NEW;
      result.type = 'new';
      result.isAuto = false;
    }
    return result;
  }
}

export default MyTFarePaymentAuto;
