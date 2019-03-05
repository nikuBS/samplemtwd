/**
 * FileName: myt-fare.bill.sms.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 * Annotation: 요금납부 시 입금전용계좌 SMS 신청
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE, SVC_ATTR_NAME, SVC_CD} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE, API_UNPAID_ERROR} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

class MyTFareBillSms extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getUnpaidList(),
      this.getAccountList()
    ).subscribe(([unpaidList, accountList]) => {
      if (unpaidList.code === API_CODE.CODE_00 || unpaidList.code === API_UNPAID_ERROR.BIL0016) {
        const isAllPaid = unpaidList.code === API_UNPAID_ERROR.BIL0016;

        res.render('bill/myt-fare.bill.sms.html', {
          isAllPaid: isAllPaid,
          unpaidList: isAllPaid ? [] : this.parseData(unpaidList.result, svcInfo, allSvc),
          virtualBankList: accountList,
          title: MYT_FARE_PAYMENT_TITLE.SMS,
          svcInfo: this.getSvcInfo(svcInfo),
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: unpaidList.code,
          msg: unpaidList.msg,
          pageInfo: pageInfo,
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

  private getAccountList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0026, {}).map((res) => {
      let accountList = [];
      if (res.code === API_CODE.CODE_00) {
        if (!FormatHelper.isEmpty(res.result.virtualBankList)) {
          accountList = res.result.virtualBankList;
        }
      }
      return accountList;
    });
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

  private getSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcNumber = svcInfo.svcAttrCd === 'M1' ? FormatHelper.conTelFormatWithDash(svcInfo.svcNum) :
        svcInfo.svcNum;
    }
    return svcInfo;
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

export default MyTFareBillSms;
