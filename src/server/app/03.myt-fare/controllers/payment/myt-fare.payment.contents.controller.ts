/**
 * FileName: myt-fare.payment.contents.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.08
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';

class MyTFarePaymentContents extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getContentsRemain()
    ).subscribe(([contentsRemain]) => {
      if (contentsRemain.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.contents.html', {
          result: this.parseData(contentsRemain.result),
          svcInfo: svcInfo,
          currentMonth: this.getCurrentMonth()
        });
      } else {
        this.errorRender(res, contentsRemain, svcInfo);
      }
    }, (error) => {
      this.errorRender(res, error, svcInfo);
    });
  }

  private getContentsRemain(): Observable<any> {
    return this.getRemainLimit('Request', '0')
      .switchMap((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return this.getRemainLimit('Done', '1')
            .switchMap((next) => {
              if (next.code === API_CODE.CODE_00) {
                return Observable.of(next);
              } else {
                return Observable.timer(3000)
                  .switchMap(() => {
                    return this.getRemainLimit('Retry', '2');
                  });
              }
            });
        } else {
          throw resp;
        }
      });
  }

  private getRemainLimit(gubun: string, requestCnt: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0081, { gubun: gubun, requestCnt: requestCnt });
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.tmthUseAmount = FormatHelper.addComma(result.tmthUseAmt);
      result.remainLimit = FormatHelper.addComma(result.remainUseLimit);
      result.tmthChrgPsblAmount = FormatHelper.addComma(result.tmthChrgPsblAmt);

      if (result.autoChrgStCd === MYT_FARE_PREPAY_AUTO_CHARGE_CODE.USE) {
        result.autoChrgAmount = FormatHelper.addComma(result.autoChrgAmt);
        result.autoChrgStrdAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
      }
    }
    result.code = API_CODE.CODE_00;
    return result;
  }

  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth();
  }

  private errorRender(res, resp, svcInfo): any {
    this.error.render(res, {
      code: resp.code,
      msg: resp.msg,
      svcInfo: svcInfo
    });
  }
}

export default MyTFarePaymentContents;
