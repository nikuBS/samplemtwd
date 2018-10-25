/**
 * FileName: myt-fare.payment.rainbow.controller.ts
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

class MyTFarePaymentRainbow extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getRainbowPoint(),
      this.getAutoRainbow()
    ).subscribe(([rainbow, auto]) => {
      if (rainbow.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.rainbow.html', {
          rainbow: this.parseData(rainbow.result),
          autoInfo: this.getAutoData(auto),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: rainbow.code,
          msg: rainbow.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getRainbowPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0042, {});
  }

  private getAutoRainbow(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0052, {});
  }

  private parseData(data: any): any {
    data.rainbowPt = FormatHelper.addComma(data.usableRbpPt);
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

export default MyTFarePaymentRainbow;
