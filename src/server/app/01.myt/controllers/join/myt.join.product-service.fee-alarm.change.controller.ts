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
import { WireLess, WirelessEnableAlarm, WirelessDisableAlarm } from '../../../../mock/server/myt.join.product-service.mock';

class MytJoinProductServiceFeeAlarmChangeController extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @private
   */
  private _getMyCurrentWirelessFeePlan(): Observable<any> {
    return Observable.of(WireLess);
    // return this.apiService.request(API_CMD.BFF_05_0136, {});
  }

  /**
   * @private
   */
  private _getMyFeePlanAlarmStatus(): Observable<any> {
    return Observable.of(WirelessEnableAlarm);
    // return this.apiService.request(API_CMD.BFF_05_0125, {});
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
    Observable.combineLatest(
      this._getMyCurrentWirelessFeePlan(),
      this._getMyFeePlanAlarmStatus()
    ).subscribe(([feePlan, alarmStatus]) => {
      const apiError = this.error.apiError([
        feePlan, alarmStatus
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '요금제 변경 가능일 알림 서비스',
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const feePlanInfo = this._convertFeePlanInfo(feePlan.result.useFeePlanPro);
      const alarmStatusInfo = this._convertAlarmStatusInfo(alarmStatus.result);

      res.render('join/myt.join.product-service.fee-alarm.change.html', {
        svcInfo: svcInfo,
        feePlanInfo: feePlanInfo,
        alarmInfo: alarmStatusInfo
      });
    });
  }
}

export default MytJoinProductServiceFeeAlarmChangeController;
