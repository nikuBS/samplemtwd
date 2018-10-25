/**
 * FileName: myt-fare.payment.contents.auto.change.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.08
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

class MyTFarePaymentContentsAutoChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.getAutoPrepayInfo().subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.contents.auto.change.html', {
          autoPrepayInfo: this.parseData(resp.result),
          svcInfo: svcInfo,
          pageInfo: pageInfo
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
    return this.apiService.request(API_CMD.BFF_07_0085, {});
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.comboStandardAmount = result.cmbAutoChrgStrdAmt / 10000;
      result.comboChargeAmount = result.cmbAutoChrgAmt / 10000;
    }
    return result;
  }
}

export default MyTFarePaymentContentsAutoChange;
