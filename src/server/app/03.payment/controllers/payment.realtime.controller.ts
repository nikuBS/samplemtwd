/**
 * FileName: payment.realtime.controller.ts
 * Author: 공자윤
 * Date: 2018.06.22
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import MyTUsage from '../../01.myt/controllers/usage/myt.usage.controller';

class PaymentRealtimeController extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_06_0001, {}).subscribe((resp) => {
      this.myTUsage.renderView(res, 'payment.realtime.html', {
        usageData: this.getResult(resp, {}),
        svcInfo
      });
    });
  }

  private getResult(resp: any, data: any): any {
    if (resp.code === API_CODE.CODE_00) {
      data = this.parseData(resp.result);
    } else {
      data = resp;
    }
    return data;
  }

  private parseData(product: any): any {
    if (!FormatHelper.isEmpty(product)) {
      product.map((data) => {
        // product.chargeDate = DateHelper.getShortDateNoDot(data.chargeDate);
      });
    }
    return product;
  }
}

export default PaymentRealtimeController;
