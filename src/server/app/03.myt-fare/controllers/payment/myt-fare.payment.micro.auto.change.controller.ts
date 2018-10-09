/**
 * FileName: myt-fare.payment.micro.auto.change.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.05
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {PREPAY_TITLE, REQUEST_TYPE} from '../../../../types/bff.old.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';

class MyTFarePaymentMicroAutoChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.getAutoPrepayInfo().subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.micro.auto.change.html', {
          autoPrepayInfo: this.parseData(resp.result),
          title: PREPAY_TITLE.MICRO,
          svcInfo: svcInfo
        });
      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getAutoPrepayInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0086, {});
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.comboStandardAmount = result.cmbAutoChrgStrdAmt / 10000;
      result.comboChargeAmount = result.cmbAutoChrgAmt / 10000;
    }
    return result;
  }
}

export default MyTFarePaymentMicroAutoChange;
