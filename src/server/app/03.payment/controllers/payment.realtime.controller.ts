/**
 * FileName: payment.realtime.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.22
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../types/api-command.type';
import { SVC_ATTR } from '../../../types/bff-common.type';
import { PAYMENT_VIEW } from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import UnpaidList from '../../../mock/server/payment/payment.realtime.unpaid.list';

class PaymentRealtimeController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0021, {}).subscribe((resp) => {
      this.renderView(res, 'payment.realtime.html', {
        list: this.getResult(resp),
        svcInfo: this.getSvcInfo(svcInfo)
      });
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    if (data.code === undefined) {
      res.render(view, data);
    } else {
      res.render(PAYMENT_VIEW.ERROR, data);
    }
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result.settleUnPaidList);
    }
    return resp;
  }

  private parseData(list: any): any {
    if (!FormatHelper.isEmpty(list)) {
      list.map((data) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.MM');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney.toString());
        data.svcName = SVC_ATTR[data.svcAttrCd];
      });
    }
    return list;
  }

  private removeZero(input: string): any {
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
