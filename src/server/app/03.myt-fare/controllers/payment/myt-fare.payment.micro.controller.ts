/**
 * FileName: myt-fare.payment.micro.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME, MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';

class MyTFarePaymentMicro extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getMicroRemain(),
      this.getHistory(),
      this.getPasswordStatus()
    ).subscribe(([microRemain, microHistory, passwordStatus]) => {
      if (microRemain.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.micro.html', {
          result: this.parseData(microRemain.result),
          usedYn: this.getHistoryInfo(microHistory),
          passwordInfo: this.getPasswordInfo(passwordStatus),
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          currentMonth: this.getCurrentMonth()
        });
      } else {
        this.errorRender(res, microRemain, svcInfo);
      }
    }, (error) => {
      this.errorRender(res, error, svcInfo);
    });
  }

  private getMicroRemain(): Observable<any> {
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
    return this.apiService.request(API_CMD.BFF_07_0073, { gubun: gubun, requestCnt: requestCnt });
  }

  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0079, {});
  }

  private getHistoryInfo(historyInfo: any): any {
    const usedValueList = ['0', '2', '6'];
    const usedYn = {
      isUsed: false,
      rtnUseYn: null
    };

    if (historyInfo.code === API_CODE.CODE_00) {
      if (historyInfo.result.rtnUseYn in usedValueList) {
        usedYn.isUsed = true;
      }
      usedYn.rtnUseYn = historyInfo.result.rtnUseYn;
    }
    return usedYn;
  }

  private getPasswordStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0085, {});
  }

  private getPasswordInfo(passwordStatus: any): any {
    if (passwordStatus.code === API_CODE.CODE_00) {
      const passwordResult = passwordStatus.result;
      passwordStatus.text = MYT_FARE_MICRO_NAME[passwordResult.cpinStCd];
    } else {
      passwordStatus.text = '';
    }
    return passwordStatus;
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

export default MyTFarePaymentMicro;
