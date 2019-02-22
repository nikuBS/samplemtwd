/**
 * FileName: myt-fare.bill.option.register.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';

class MyTFareBillOptionRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) {
      Observable.combineLatest(
        this.getPaymentOption()
      ).subscribe(([paymentOption]) => {
        if (paymentOption.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.option.register.html', {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            paymentOption: this.parseData(paymentOption.result)
          });
        } else {
          this.error.render(res, {
            code: paymentOption.code,
            msg: paymentOption.msg,
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  private getPaymentOption(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  private parseData(result): any {
    result.payCode = '1';
    result.payDate = '11';

    if (result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK || result.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD) {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_CHANGE;
      result.buttonName = MYT_FARE_PAYMENT_NAME.CHANGE;
      result.type = 'change';
      result.isAuto = true;

      if (result.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD && result.payCyclNm !== undefined) {
        result.payCode = result.payCyclCd;
        result.payDate = result.payCyclNm;
      }
    } else {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_NEW;
      result.buttonName = MYT_FARE_PAYMENT_NAME.NEW;
      result.type = 'new';
      result.isAuto = false;
    }

    result.bankList = this.getBankList(result.lBankArray);
    return result;
  }

  private getBankList(bankArray: any[]): any {
    const bankList: any = [];
    if (!FormatHelper.isEmpty(bankArray)) {
      for (let i = 0; i < bankArray.length; i++) {
        const obj = {
          bankCardCoCd: bankArray[i].commCdVal,
          bankCardCoNm: bankArray[i].commCdValNm
        };
        bankList.push(obj);
      }
      return JSON.stringify(bankList);
    }
    return bankList;
  }
}

export default MyTFareBillOptionRegister;
