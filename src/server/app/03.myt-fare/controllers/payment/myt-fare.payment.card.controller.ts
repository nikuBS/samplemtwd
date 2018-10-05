/**
 * FileName: myt-fare.payment.card.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_TYPE, SVC_ATTR_NAME} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';

class MyTFarePaymentCard extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    Observable.combineLatest(
      this.getUnpaidList(),
      this.getAutoInfo()
    ).subscribe(([unpaidList, autoInfo]) => {
      if (unpaidList.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.card.html', {
          unpaidList: this.parseData(unpaidList.result, svcInfo),
          autoInfo: this.parseInfo(autoInfo),
          title: MYT_FARE_PAYMENT_TITLE.CARD,
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

  private getAutoInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0022, {}).map((res) => {
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

  private parseInfo(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      const result = autoInfo.result;
      autoInfo.isAuto = result.autoPayEnable === 'Y' && result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK;
      autoInfo.bankName = autoInfo.isAuto ? result.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, '') : null;
    } else {
      autoInfo.isAuto = false;
    }
    return autoInfo;
  }

}

export default MyTFarePaymentCard;
