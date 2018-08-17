/**
 * FileName: myt.join.product-service.fee-alarm.change.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.17
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { WireLess, WirelessEnableAlarm, WirelessDisableAlarm } from '../../../../mock/server/myt.join.product-service.mock';

class MytJoinProductServiceFeeAlarmChangeController extends TwViewController {
  constructor() {
    super();
  }

  private _feePlanInfo: any;
  private _alarmStatus: any;

  /**
   * @param code
   * @private
   */
  private _isSuccess(code): any {
    return API_CODE.CODE_00 === code;
  }

  /**
   * @param feePlanInfo
   * @private
   */
  private _convertFeePlanInfo(feePlanInfo): any {
    return Object.assign(feePlanInfo.useFeePlanPro, {
      scrbDt: DateHelper.getShortDateWithFormat(feePlanInfo.useFeePlanPro.scrbDt, 'YY.MM.DD')
    });
  }

  /**
   * @param alarmInfo
   * @private
   */
  private _convertAlarmInfo(alarmInfo): any {
    return Object.assign(alarmInfo, {
      notiSchdDt: DateHelper.getShortDateWithFormat(alarmInfo.notiSchdDt, 'YY.MM.DD'),
      reqDt: DateHelper.getShortDateWithFormat(alarmInfo.reqDt, 'YY.MM.DD')
    });
  }

  /**
   * @todo
   * @private
   */
  private _getMockDataFeePlan(): Observable<any> {
    return Observable.of(WireLess);
  }

  /**
   * @todo
   * @private
   */
  private _getMockDataAlarmStatus(): Observable<any> {
    return Observable.of(WirelessEnableAlarm);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // const myCurrentWirelessFeePlanApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0136, {}, {});
    // const myFeePlanAlarmStatusApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0125, {}, {});
    const myCurrentWirelessFeePlanApi: Observable<any> = this._getMockDataFeePlan();
    const myFeePlanAlarmStatusApi: Observable<any> = this._getMockDataAlarmStatus();
    const thisMain = this;

    Observable.combineLatest(
      myCurrentWirelessFeePlanApi,
      myFeePlanAlarmStatusApi
    ).subscribe({
      next([
       feePlan,
       alarmStatus
     ]) {
        thisMain._feePlanInfo = thisMain._isSuccess(feePlan.code) ? feePlan.result : null;
        thisMain._alarmStatus = thisMain._isSuccess(alarmStatus.code) ? alarmStatus.result : null;

        const apiError = thisMain.error.apiError([
            feePlan, alarmStatus
        ]);

        if (!FormatHelper.isEmpty(apiError)) {
          return thisMain.error.render(res, {
            title: '요금제 변경 가능일 알림 서비스',
            code: apiError.code,
            msg: apiError.msg,
            svcInfo: svcInfo
          });
        }
      },
      complete() {
        res.render('join/myt.join.product-service.fee-alarm.change.html', {
          svcInfo: svcInfo,
          feePlanInfo: thisMain._convertFeePlanInfo(thisMain._feePlanInfo),
          alarmInfo: thisMain._convertAlarmInfo(thisMain._alarmStatus)
        });
      }
    });
  }
}

export default MytJoinProductServiceFeeAlarmChangeController;