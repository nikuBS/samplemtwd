/**
 * FileName: payment.realtime.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.22
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../types/api-command.type';
import { SVC_CD } from '../../../types/bff-common.type';
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
        list: this.getResult(UnpaidList),
        svcInfo
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
        data.invMoney = FormatHelper.addComma(data.invAmt);
        data.svcName = SVC_CD[data.svcCd];
      });
    }
    return list;
  }
}

export default PaymentRealtimeController;
