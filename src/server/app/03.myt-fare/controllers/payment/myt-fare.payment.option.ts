/**
 * FileName: myt-fare.payment.option.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {PAYMENT_OPTION, SVC_ATTR} from '../../../../types/bff.old.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';

class MytFarePaymentOption extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    Observable.combineLatest(
      this.getPaymentOption(),
      this.getAddrInfo()
    ).subscribe(([paymentOption, addrInfo]) => {
      if (paymentOption.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.option.html', {
          svcInfo: this.getSvcInfo(svcInfo),
          paymentOption: this.parseData(paymentOption.result),
          addrInfo: this.parseInfo(addrInfo.result)
        });
      } else {
        this.error.render(res, {
          code: paymentOption.code,
          msg: paymentOption.msg,
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
      console.log(res.result);
      return res;
    });
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR[svcInfo.svcAttrCd];
    svcInfo.phoneNum = StringHelper.phoneStringToDash(svcInfo.svcNum);

    return svcInfo;
  }

  private parseData(data: any): any {
    if (data.payMthdCd === PAYMENT_OPTION.BANK) {
      data.fstDrwSchdDate = DateHelper.getShortDateNoDot(data.fstDrwSchdDt);
      data.isAuto = true;
    } else if (data.payMthdCd === PAYMENT_OPTION.CARD) {
      data.cardYm = FormatHelper.makeCardYymm(data.cardEffYm);
      data.fstDrwSchdDate = DateHelper.getShortDateNoDot(data.fstDrwSchdDt);
      data.isAuto = true;
    } else {
      data.isAuto = false;
    }
    return data;
  }

  private parseInfo(info: any): any {
    if (info.svcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.svcNum);
    }

    if (info.address) {
      info.addr = info.address.replace('<br/>', '\n');
    }
    return info;
  }
}

export default MytFarePaymentOption;
