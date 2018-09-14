/**
 * FileName: payment.prepay.contents.auto.change.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.08
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { PREPAY_TITLE } from '../../../types/bff.old.type';
import { Observable } from 'rxjs/Observable';

class PaymentPrepayContentsAutoChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getAutoPrepayInfo(),
      this.getAutoCardInfo()
    ).subscribe(([ autoPrepayInfo, autoCardInfo ]) => {
      if (autoPrepayInfo.code === API_CODE.CODE_00) {
        res.render('payment.prepay.contents.auto.change.html', {
          autoPrepayInfo: this.parseData(autoPrepayInfo.result),
          autoCardInfo: autoCardInfo,
          title: PREPAY_TITLE.CONTENTS,
          svcInfo: svcInfo
        });
      } else {
        res.render('payment.prepay.error.html', { err: autoPrepayInfo, svcInfo: svcInfo, title: PREPAY_TITLE.AUTO_PREPAY });
      }
    });
  }

  private getAutoPrepayInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0085, {}).map((res) => {
      return res;
    });
  }

  private getAutoCardInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0089, {}).map((res) => {
      let autoCardInfo = null;
      if (res.code === API_CODE.CODE_00) {
        if (res.result.payMthdCd === '02') {
          autoCardInfo = res.result;
        }
      }
      return autoCardInfo;
    });
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChrgStrdAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
      result.autoChrgAmount = FormatHelper.addComma(result.autoChrgAmt);
      result.comboStandardAmount = result.autoChrgStrdAmt / 10000;
      result.comboChargeAmount = result.autoChrgAmt / 10000;
    }
    result.code = API_CODE.CODE_00;
    return result;
  }
}

export default PaymentPrepayContentsAutoChange;
