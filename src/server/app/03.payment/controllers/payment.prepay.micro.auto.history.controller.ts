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
import { PREPAY_TITLE, REQUEST_TYPE } from '../../../types/bff.type';
import { Observable } from 'rxjs/Observable';

class PaymentPrepayMicroAutoHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getAutoCardInfo(),
      this.getAutoPrepayHistory()
    ).subscribe(([ autoCardInfo, autoPrepay ]) => {
      if (autoCardInfo.code === API_CODE.CODE_00 && autoPrepay.code === API_CODE.CODE_00) {
        res.render('payment.prepay.micro.auto.history.html', {
          autoCardInfo: this.parseCardInfo(autoCardInfo.result),
          autoPrepay: this.parsePrepayData(autoPrepay.result),
          svcInfo: svcInfo
        });
      } else {
        res.render('payment.prepay.error.html', { err: autoPrepay, svcInfo: svcInfo, title: PREPAY_TITLE.AUTO_PREPAY_HISTORY });
      }
    });
  }

  private getAutoCardInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0072, {}).map((res) => {
      return res;
    });
  }

  private getAutoPrepayHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0075, { pageNo: 1, listSize: 20 }).map((res) => {
      return res;
    });
  }

  private parseCardInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChargeAmount = FormatHelper.addComma(result.autoChrgAmt);
      result.autoChargeStandardAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
    }
    return result;
  }

  private parsePrepayData(result: any): any {
    const record = result.microPrepayReqRecord;
    if (!FormatHelper.isEmpty(record)) {
      record.map((data) => {
        data.name = REQUEST_TYPE[data.autoChrgReqClCd];
        data.date = DateHelper.getFullDateAndTime(data.operDtm);
        data.autoChrgStrdAmount = FormatHelper.addComma(data.autoChrgStrdAmt);
        data.autoChrgAmount = FormatHelper.addComma(data.autoChrgAmt);
      });
    }
    record.code = API_CODE.CODE_00;
    record.totalCnt = result.totalCnt;
    return record;
  }
}

export default PaymentPrepayMicroAutoHistory;
