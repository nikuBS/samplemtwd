/**
 * FileName: payment.prepay.contents.pay.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.07
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { PREPAY_TITLE } from '../../../types/bff-common.type';
import { Observable } from 'rxjs/Observable';

class PaymentPrepayContentsPayController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getPrepayInfo({ gubun: 'Request', requestCnt: 0 }),
      this.getPrepayInfo({ gubun: 'Done', requestCnt: 1 }),
      this.getAutoCardInfo()
    ).subscribe(([{}, prepayInfo, autoCardInfo]) => {
      if (prepayInfo.code === API_CODE.CODE_00) {
        res.render('payment.prepay.contents.pay.html', {
          prepayInfo: this.parseData(prepayInfo.result),
          autoCardInfo: autoCardInfo,
          svcInfo: svcInfo
        });
      } else {
        res.render('payment.prepay.error.html', { err: prepayInfo, svcInfo: svcInfo, title: PREPAY_TITLE.PREPAY });
      }
    });
  }

  private getPrepayInfo(param: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0081, param).map((res) => {
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
      result.possibleAmount = FormatHelper.addComma(result.tmthChrgPsblAmt);
    }
    result.code = API_CODE.CODE_00;
    return result;
  }
}

export default PaymentPrepayContentsPayController;
