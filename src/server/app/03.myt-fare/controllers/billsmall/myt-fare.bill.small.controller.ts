/**
 * FileName: myt-fare.bill.small.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 * Annotation: 소액결제 메인화면
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME, MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';

class MyTFareBillSmall extends TwViewController {
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
        res.render('billsmall/myt-fare.bill.small.html', {
          result: this.parseData(microRemain.result),
          usedYn: this.getHistoryInfo(microHistory),
          passwordInfo: this.getPasswordInfo(passwordStatus),
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          currentMonth: this.getCurrentMonth()
        });
      } else {
        this.errorRender(res, microRemain, svcInfo, pageInfo);
      }
    }, (error) => {
      this.errorRender(res, error, svcInfo, pageInfo);
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
      .switchMap((next) => {
        if (next.code === API_CODE.CODE_00) {
          return Observable.of(next);
        } else {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Done', '2');
            });
        }
      })
      .switchMap((next) => {
        if (next.code === API_CODE.CODE_00) {
          return Observable.of(next);
        } else {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Done', '3');
            });
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
      isPassword: false,
      rtnUseYn: null
    };

    if (historyInfo.code === API_CODE.CODE_00) {
      const rtnUseYn = historyInfo.result.rtnUseYn;
      for (let i = 0; i < usedValueList.length; i++) {
        if (rtnUseYn === usedValueList[i]) {
          usedYn.isUsed = true;
        }
      }
      usedYn.rtnUseYn = historyInfo.result.rtnUseYn;
      usedYn.isPassword = historyInfo.result.cpmsYn === 'Y';
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
      passwordStatus.cpmsYn = passwordResult.cpmsYn;
    } else {
      if (passwordStatus.code === 'BIL0054') {
        passwordStatus.text = MYT_FARE_MICRO_NAME['NC'];
        passwordStatus.result = {};
        passwordStatus.result.cpinStCd = 'NA00003909';
      } else {
        passwordStatus.text = '';
      }
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

  private errorRender(res, resp, svcInfo, pageInfo): any {
    this.error.render(res, {
      code: resp.code,
      msg: resp.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTFareBillSmall;
