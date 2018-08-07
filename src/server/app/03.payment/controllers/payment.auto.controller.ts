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
import {PAYMENT_OPTION, PAYMENT_OPTION_TEXT, SVC_ATTR} from '../../../types/bff.type';

class PaymentAutoController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0060, {}).subscribe((resp) => {
      res.render('payment.auto.html', this.getData(svcInfo, resp));
    });
  }

  private getResult(resp: any): any {
    if (resp.code === API_CODE.CODE_00) {
      return this.parseData(resp.result);
    }
    return resp;
  }

  private parseData(data: any): any {
    if (data.payMthdCd === PAYMENT_OPTION.BANK) {
      data.option = 'bank';
      data.paymentTitle = PAYMENT_OPTION_TEXT.BANK;
      data.name = PAYMENT_OPTION_TEXT.BANK_NAME;
      data.numberTitle = PAYMENT_OPTION_TEXT.ACCOUNT;
    } else if (data.payMthdCd === PAYMENT_OPTION.CARD) {
      data.option = 'card';
      data.paymentTitle = PAYMENT_OPTION_TEXT.CARD;
      data.name = PAYMENT_OPTION_TEXT.CARD_NAME;
      data.numberTitle = PAYMENT_OPTION_TEXT.CARD_NUM;
      data.cardYm = FormatHelper.makeCardYymm(data.cardEffYm);
    } else if (data.payMthdCd === PAYMENT_OPTION.GIRO) {
      data.option = 'giro';
      data.paymentTitle = PAYMENT_OPTION_TEXT.GIRO;
    } else {
      data.option = 'virtual';
      data.paymentTitle = PAYMENT_OPTION_TEXT.VIRTUAL;
    }
    data.firstOutDate = DateHelper.getShortDateNoDot(data.fstDrwSchdDt);
    data.code = API_CODE.CODE_00;
    return data;
  }

  private getData(svcInfo: any, result: any): any {
    return {
      svcInfo: this.getSvcInfo(svcInfo),
      payment: this.getResult(result)
    };
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR[svcInfo.svcAttrCd];
    return svcInfo;
  }
}

export default PaymentAutoController;
