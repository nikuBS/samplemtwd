/**
 * FileName: myt-fare.bill.tpoint.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
import {SELECT_POINT} from '../../../../types/string.type';
import StringHelper from '../../../../utils/string.helper';

class MyTFareBillTPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getTPoint(),
      this.getAutoTPoint()
    ).subscribe(([tpoint, auto]) => {
      if (tpoint.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.tpoint.html', {
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
          pageInfo: pageInfo,
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
    data.point = FormatHelper.addComma(data.availTPt);
    data.cardNumber = StringHelper.masking(data.ocbCcno, '*', 10);
    data.endDate = DateHelper.getNextYearShortDate();

    return data;
  }

  private getAutoData(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      return {
        isAuto: autoInfo.result.strRbpStatTxt === MYT_FARE_PAYMENT_NAME.IS_AUTO,
        endDate: FormatHelper.isEmpty(autoInfo.result.disOcbEffDate) ? DateHelper.getNextYearShortDate()
          : DateHelper.getShortDate(autoInfo.result.disOcbEffDate),
        ocbTermTodoAmt: FormatHelper.addComma(autoInfo.result.ocbTermTodoAmt),
        amtId: FormatHelper.isEmpty(autoInfo.result.ocbTermTodoAmt) ? null : autoInfo.result.ocbTermTodoAmt,
        amtText: FormatHelper.isEmpty(autoInfo.result.ocbTermTodoAmt) ? SELECT_POINT.DEFAULT :
          FormatHelper.addComma(autoInfo.result.ocbTermTodoAmt) + 'P'
      };
    }
    return null;
  }

}

export default MyTFareBillTPoint;
