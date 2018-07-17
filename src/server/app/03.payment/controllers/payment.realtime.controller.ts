/**
 * FileName: payment.realtime.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.22
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../types/api-command.type';
import { SVC_CD, SVC_ATTR } from '../../../types/bff-common.type';
import { PAYMENT_VIEW } from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

class PaymentRealtimeController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0021, {}).subscribe((resp) => {
      res.render('payment.realtime.html', {
        list: this.getResult(resp),
        svcInfo: this.getSvcInfo(svcInfo)
      });
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result.settleUnPaidList);
    }
    return resp;
  }

  private parseData(list: any): any {
    if (!FormatHelper.isEmpty(list)) {
      if (list.length === 1) {
        list.isAlone = true;
      }
      list.totalAmount = 0;
      list.map((data) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.MM');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney);
        data.svcName = SVC_CD[data.svcCd];
        list.totalAmount += parseInt(data.intMoney, 10);
      });
    }
    list.code = API_CODE.CODE_00;
    list.totalAmount = FormatHelper.addComma(list.totalAmount.toString());
    return list;
  }

  private removeZero(input: string): string {
    let isNotZero = false;
    for (let i = 0; i < input.length; i++) {
      if (!isNotZero) {
        if (input[i] !== '0') {
          input = input.substr(i, input.length - i);
          isNotZero = true;
        }
      }
    }
    return input;
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR[svcInfo.svcAttrCd];
    return svcInfo;
  }
}

export default PaymentRealtimeController;
