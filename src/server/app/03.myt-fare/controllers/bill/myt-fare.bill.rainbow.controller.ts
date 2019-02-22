/**
 * FileName: myt-fare.bill.rainbow.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_PAYMENT_NAME, RAINBOW_FARE_CODE, RAINBOW_FARE_NAME} from '../../../../types/bff.type';
import {DEFAULT_SELECT, SELECT_POINT} from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

class MyTFareBillRainbow extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getRainbowPoint(),
      this.getAutoRainbow()
    ).subscribe(([rainbow, auto]) => {
      if (rainbow.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.rainbow.html', {
          rainbow: this.parseData(rainbow.result),
          autoInfo: this.getAutoData(auto),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: rainbow.code,
          msg: rainbow.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo
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
    data.point = FormatHelper.addComma(data.usableRbpPt);
    return data;
  }

  private getAutoData(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      return {
        isAuto: autoInfo.result.reqStateNm === MYT_FARE_PAYMENT_NAME.IS_AUTO,
        autoFareCode: FormatHelper.isEmpty(autoInfo.result.reqProdNm) ? '' : RAINBOW_FARE_CODE[autoInfo.result.reqProdNm],
        autoFareText: FormatHelper.isEmpty(autoInfo.result.reqProdNm) ? DEFAULT_SELECT.SELECT : RAINBOW_FARE_NAME[autoInfo.result.reqProdNm]
      };
    }
    return null;
  }

}

export default MyTFareBillRainbow;
