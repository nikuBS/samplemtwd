/**
 * FileName: myt-fare.payment.micro.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { AUTO_CHARGE_CODE, PREPAY_TITLE } from '../../../../types/bff.old.type';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME} from '../../../../types/bff.type';

class MytFarePaymentMicro extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getMicroRemain(),
      this.getHistory(),
      this.getPasswordStatus()
    ).subscribe(([microRemain, microHistory, passwordStatus]) => {
      if (microRemain.code === API_CODE.CODE_00) {
        res.render('payment/myt-fare.payment.micro.html', {
          result: this.parseData(microRemain.result),
          usedYn: this.getHistoryInfo(microHistory),
          passwordText: this.getPasswordText(passwordStatus),
          svcInfo: svcInfo,
          currentMonth: this.getCurrentMonth(),
          title: PREPAY_TITLE.MICRO
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
          return this.getRemainLimit('Done', '1');
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return resp;
        } else {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Retry', '2');
            });
        }
      });
  }

  private getRemainLimit(gubun: string, requestCnt: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0073, { gubun: gubun, requestCnt: requestCnt });
  }

  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0079, {});
  }

  private getHistoryInfo(historyInfo: any): any {
    console.log(historyInfo);
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

  private getPasswordText(passwordResult: any): string {
    console.log(passwordResult);
    let text = MYT_FARE_MICRO_NAME.NC;
    if (passwordResult.code === API_CODE.CODE_00) {
      if (passwordResult.result.cpinStCd === 'NC') {
        text = MYT_FARE_MICRO_NAME.NC;
      } else {
        text = MYT_FARE_MICRO_NAME.AC;
      }
    }
    return text;
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      console.log(result);
      result.tmthUseAmount = FormatHelper.addComma(result.tmthUseAmt);
      result.remainLimit = FormatHelper.addComma(result.remainUseLimit);
      result.tmthChrgPsblAmount = FormatHelper.addComma(result.tmthChrgPsblAmt);

      if (result.autoChrgStCd === AUTO_CHARGE_CODE.USE) {
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

export default MytFarePaymentMicro;
