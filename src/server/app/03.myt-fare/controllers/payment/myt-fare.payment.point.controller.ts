/**
 * FileName: myt-fare.payment.point.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE, SVC_ATTR_NAME} from '../../../../types/bff.type';

class MyTFarePaymentPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    Observable.combineLatest(
      this.getUnpaidList(),
      this.getPoint()
    ).subscribe(([unpaidList, point]) => {
      if (unpaidList.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.point.html', {
          unpaidList: this.parseData(unpaidList.result, svcInfo),
          title: MYT_FARE_PAYMENT_TITLE.OKCASHBAG,
          svcInfo: svcInfo
        });
      } else {
        this.error.render(res, {
          code: unpaidList.code,
          msg: unpaidList.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getUnpaidList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0021, {}).map((res) => {
      return res;
    });
  }

  private getPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0041, {}).map((res) => {
      return res;
    });
  }

  private parseData(result: any, svcInfo: any): any {
    const list = result.settleUnPaidList;
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.invDt = '';
      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.MM');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney);
        data.svcName = SVC_ATTR_NAME['M1'];
        if (svcInfo.svcMgmtNum === data.svcMgmtNum && data.invDt > list.invDt) {
          list.invDt = data.invDt;
          list.defaultIndex = index;
        }
      });
    }
    list.code = API_CODE.CODE_00;
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

}

export default MyTFarePaymentPoint;
