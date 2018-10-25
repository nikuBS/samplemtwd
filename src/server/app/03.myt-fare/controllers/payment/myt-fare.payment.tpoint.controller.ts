/**
 * FileName: myt-fare.payment.tpoint.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.24
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
import {SELECT_POINT} from '../../../../types/string.old.type';
import StringHelper from '../../../../utils/string.helper';
import {PAYMENT_OPTION_TEXT} from '../../../../types/bff.old.type';

class MyTFarePaymentTPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getTPoint(),
      this.getAutoTPoint()
    ).subscribe(([tpoint, auto]) => {
      if (tpoint.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.tpoint.html', {
          tpoint: this.parseData(tpoint.result),
          autoInfo: this.getAutoData(auto),
          title: MYT_FARE_PAYMENT_TITLE.TPOINT,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: tpoint.code,
          msg: tpoint.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getTPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0041, {});
  }

  private getAutoTPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0051, { ptClCd: 'TPT' });
  }

  private parseData(data: any): any {
    data.cashbagPt = FormatHelper.addComma(data.availTPt);
    data.cardNum = StringHelper.masking(data.ocbCcno, '*', 10);
    data.endDate = DateHelper.getNextYearShortDate();

    return data;
  }

  private getAutoData(autoInfo: any): any {
    // if (autoInfo.code === API_CODE.CODE_00) {
    //   return {
    //     strRbpStatTxt: response.result.strRbpStatTxt,
    //     endDate: FormatHelper.isEmpty(response.result.disOcbEffDate) ? DateHelper.getNextYearShortDate()
    //       : DateHelper.getShortDateNoDot(response.result.disOcbEffDate),
    //     ocbTermTodoAmt: FormatHelper.addComma(response.result.ocbTermTodoAmt),
    //     amtText: FormatHelper.isEmpty(response.result.ocbTermTodoAmt) ? SELECT_POINT.DEFAULT : FormatHelper.addComma(response.result.ocbTermTodoAmt)
    //   };
    // }
    return null;
  }

}

export default MyTFarePaymentTPoint;
