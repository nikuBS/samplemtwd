/**
 * FileName: myt-fare.bill.option.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 * Annotation: 납부방법 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import {MYT_FARE_PAYMENT_TYPE, SVC_ATTR_NAME} from '../../../../types/bff.type';

class MyTFareBillOption extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getPaymentOption(),
      this.getAddrInfo()
    ).subscribe(([paymentOption, addrInfo]) => {
      if (paymentOption.code === API_CODE.CODE_00 && addrInfo.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.option.html', {
          svcInfo: this.getSvcInfo(svcInfo),
          pageInfo: pageInfo,
          paymentOption: this.parseData(paymentOption.result, svcInfo),
          addrInfo: this.parseInfo(addrInfo.result)
        });
      } else {
        this.error.render(res, {
          code: paymentOption.code === API_CODE.CODE_00 ? addrInfo.code : paymentOption.code,
          msg: paymentOption.code === API_CODE.CODE_00 ? addrInfo.msg : paymentOption.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getPaymentOption(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  private getAddrInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0146, {}).map((res) => {
      return res;
    });
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR_NAME[svcInfo.svcAttrCd];
    svcInfo.phoneNum = StringHelper.phoneStringToDash(svcInfo.svcNum);

    return svcInfo;
  }

  private parseData(data: any, svcInfo: any): any {
    if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK) {
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt);
      data.phoneNum = svcInfo.svcAttrCd.indexOf('M') === -1 ? StringHelper.phoneStringToDash(data.cntcNum)
        : svcInfo.phoneNum;
      data.isAuto = true;
    } else if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD) {
      data.cardYm = FormatHelper.makeCardYymm(data.cardEffYm);
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt);
      data.phoneNum = svcInfo.svcAttrCd.indexOf('M') === -1 ? StringHelper.phoneStringToDash(data.cntcNum)
        : svcInfo.phoneNum;
      data.isAuto = true;
    } else {
      data.isAuto = false;
    }
    return data;
  }

  private parseInfo(info: any): any {
    if (info.dispSvcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.dispSvcNum);
    }

    if (info.address) {
      Object.assign({}, info, this.removeBr(info, 'address', 'addr'));
    }

    if (info.account) {
      Object.assign({}, info, this.removeBr(info, 'account', 'accn'));
    }
    return info;
  }

  private removeBr(info: any, name: string, subName: string): any {
    let brCode = '<br>';
    if (info[name].match('<br/>')) {
      brCode = '<br/>';
    }
    info[subName + '1'] = info[name].split(brCode)[0];
    info[subName + '2'] = info[name].split(brCode)[1];

    return info;
  }
}

export default MyTFareBillOption;
