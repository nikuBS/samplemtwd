/**
 * FileName: myt.join.product-service.fee-alarm.change.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.17
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinProductServiceFeeAlarmChange extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @private
   */
  private _getMyCurrentWirelessFeePlan(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0136, {});
  }

  /**
   * @private
   */
  private _getMyFeePlanAlarmStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0125, {});
  }

  /**
   * @param feePlan
   * @private
   */
  private _convertFeePlanInfo(feePlan): any {
    return Object.assign(feePlan, {
      scrbDt: DateHelper.getShortDateWithFormat(feePlan.scrbDt, 'YYYY.MM.DD')
    });
  }

  /**
   * @param alarmStatus
   * @private
   */
  private _convertAlarmStatusInfo(alarmStatus): any {
    return Object.assign(alarmStatus, {
      notiSchdDt: DateHelper.getShortDateWithFormat(alarmStatus.notiSchdDt, 'YYYY.MM.DD'),
      reqDt: DateHelper.getShortDateWithFormat(alarmStatus.reqDt, 'YYYY.MM.DD')
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
      return this.error.render(res, {
        title: '요금제 변경 가능일 알림 서비스 신청/해지',
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this._getMyCurrentWirelessFeePlan(),
      this._getMyFeePlanAlarmStatus()
    ).subscribe(([feePlan, alarmStatus]) => {
      const apiError = this.error.apiError([
        feePlan, alarmStatus
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '요금제 변경 가능일 알림 서비스 신청/해지',
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      res.render('join/myt.join.product-service.fee-alarm.change.html', {
        svcInfo: svcInfo,
        feePlanInfo: this._convertFeePlanInfo(feePlan.result.feePlanProd),
        alarmInfo: this._convertAlarmStatusInfo(alarmStatus.result)
      });
    });
  }
}

export default MyTJoinProductServiceFeeAlarmChange;
