/**
 * FileName: myt-fare.bill.account.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_TYPE, SVC_ATTR_NAME, SVC_CD} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillAccount extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const data = {
      title: MYT_FARE_PAYMENT_TITLE.ACCOUNT,
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    if (BrowserHelper.isApp(req)) {
      Observable.combineLatest(
        this.getUnpaidList(),
        this.getAutoInfo()
      ).subscribe(([unpaidList, autoInfo]) => {
        if (unpaidList.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.account.html', {
            ...data,
            unpaidList: this.parseData(unpaidList.result, svcInfo),
            autoInfo: this.parseInfo(autoInfo)
          });
        } else {
          this.error.render(res, {
            code: unpaidList.code, msg: unpaidList.msg, svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  private getUnpaidList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0021, {});
    // return Observable.of(UnpaidList);
  }

  private getAutoInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0022, {});
  }

  private parseData(result: any, svcInfo: any): any {
    const list = result.settleUnPaidList;
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.invDt = '';
      list.defaultIndex = 0;

      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.M');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney);
        data.svcName = SVC_CD[data.svcCd];
        data.svcNumber = data.svcCd === 'C' ? FormatHelper.conTelFormatWithDash(data.svcNum) : data.svcNum;

        if (svcInfo.svcMgmtNum === data.svcMgmtNum && data.invDt > list.invDt) {
          list.invDt = data.invDt;
          list.defaultIndex = index;
        }
      });
    }
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

      result.isAuto = result.autoPayEnable === 'Y' && result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK;
      if (result.isAuto) {
        result.bankFullName = result.autoPayBank.bankCardCoNm;
        result.bankName = result.autoPayBank.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, '');
        result.bankNum = result.autoPayBank.bankCardNum;
        result.bankCode = result.autoPayBank.bankCardCoCd;
      }
      return result;
    }
    return null;
  }

}

export default MyTFareBillAccount;
