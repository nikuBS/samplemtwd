/**
 * FileName: myt-fare.bill.point.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE, SVC_CD} from '../../../../types/bff.type';

class MyTFareBillPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getUnpaidList(),
      this.getPoint()
    ).subscribe(([unpaidList, point]) => {
      if (unpaidList.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.point.html', {
          unpaidList: this.parseData(unpaidList.result, svcInfo),
          title: MYT_FARE_PAYMENT_TITLE.OKCASHBAG,
          svcInfo: svcInfo,
          pageInfo: pageInfo
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
      list.defaultIndex = 0;

      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.MM');
        data.intMoney = this.removeZero(data.invAmt);
        data.invMoney = FormatHelper.addComma(data.intMoney);
        data.svcName = SVC_CD[data.svcCd];

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

}

export default MyTFareBillPoint;
