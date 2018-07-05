/**
 * FileName: payment.auto.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.22
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import MyTUsage from '../../01.myt/controllers/usage/myt.usage.controller';
import {PAYMENT_VIEW} from '../../../types/string.type';
import {SVC_CD} from '../../../types/bff-common.type';
import UnpaidList from '../../../mock/server/payment/payment.realtime.unpaid.list';

class PaymentAutoController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0060, {}).subscribe((resp) => {
      this.renderView(res, 'payment.auto.html', {
        payment: { option: 'card' },
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
      return this.parseData(resp.result);
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

export default PaymentAutoController;
