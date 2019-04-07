/**
 * MyT > 나의 가입정보 > 나의 요금제 > 요금제 변경 가능일 알림 서비스 해지
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-08-19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 */
class MyTJoinMyplanAlarmterminate extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 요금제 가입 정보값 변환
   * @param feePlan - 요금제 정보
   */
  private _convertFeePlanInfo(feePlan): any {
    return Object.assign(feePlan, {
      scrbDt: DateHelper.getShortDateWithFormat(feePlan.scrbDt, 'YYYY.M.D.')  // 가입일
    });
  }

  /**
   * 알림 서비스 가입 상태 값 변환
   * @param alarmStatus - 알림 서비스 가입 상태
   */
  private _convertAlarmStatusInfo(alarmStatus): any {
    return Object.assign(alarmStatus, {
      notiSchdDt: DateHelper.getShortDateWithFormat(alarmStatus.notiSchdDt, 'YYYY.M.D.'), // 예정일
      svcNum: FormatHelper.conTelFormatWithDash(alarmStatus.svcNum),  // 회선 번호 하이픈 처리
      reqDt: DateHelper.getShortDateWithFormat(alarmStatus.reqDt, 'YYYY.M.D.')  // 신청일
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo = {
      title: '요금제 변경 가능일 알림 서비스', // 제목
      pageInfo: pageInfo, // 페이지 정보
      svcInfo: svcInfo  // 사용자 정보
    };

    // 휴대폰, 선불폰 아닐때 오류 처리
    if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0136, {}),
      this.apiService.request(API_CMD.BFF_05_0125, {})
    ).subscribe(([feePlan, alarmStatus]) => {
      const apiError = this.error.apiError([
        feePlan, alarmStatus
      ]);

      // API 오류
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      // 렌더링
      res.render('myplan/myt-join.myplan.alarmterminate.html', Object.assign(renderCommonInfo, {
        feePlanInfo: this._convertFeePlanInfo(feePlan.result.feePlanProd),
        alarmInfo: this._convertAlarmStatusInfo(alarmStatus.result)
      }));
    });
  }
}

export default MyTJoinMyplanAlarmterminate;
