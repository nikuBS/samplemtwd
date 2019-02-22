/**
 * FileName: myt-fare.bill.card.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_TYPE, SVC_ATTR_NAME, SVC_CD} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillCard extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const data = {
      title: MYT_FARE_PAYMENT_TITLE.CARD,
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    if (BrowserHelper.isApp(req)) {
      Observable.combineLatest(
        this.getUnpaidList(),
        this.getAutoInfo()
      ).subscribe(([unpaidList, autoInfo]) => {
        if (unpaidList.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.card.html', {
            ...data,
            unpaidList: this.parseData(unpaidList.result, svcInfo, allSvc),
            autoInfo: this.parseInfo(autoInfo)
          });
        } else {
          this.error.render(res, {
            code: unpaidList.code, msg: unpaidList.msg, pageInfo: pageInfo, svcInfo: svcInfo
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
  }

  private getAutoInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0022, {});
  }

  private parseData(result: any, svcInfo: any, allSvc: any): any {
    const list = result.settleUnPaidList;
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.invDt = '';
      list.defaultIndex = 0;

      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.M.');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney);
        data.svcName = SVC_CD[data.svcCd];
        data.svcNumber = data.svcCd === 'I' || data.svcCd === 'T' ? this.getAddr(data.svcMgmtNum, allSvc) :
          FormatHelper.conTelFormatWithDash(data.svcNum);

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
        result.bankName = result.autoPayBank.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, '');
        result.bankNum = result.autoPayBank.bankCardNum;
        result.bankCode = result.autoPayBank.bankCardCoCd;
      }
      return result;
    }
    return null;
  }

  private getAddr(svcMgmtNum: any, allSvc: any): any {
    const serviceArray = allSvc.s;
    let addr = '';

    serviceArray.map((data) => {
      if (data.svcMgmtNum === svcMgmtNum) {
        addr = data.addr;
      }
    });

    return addr;
  }

}

export default MyTFareBillCard;
