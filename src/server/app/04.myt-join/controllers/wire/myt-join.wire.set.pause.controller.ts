/**
 * MenuName: 나의가입정보(인터넷/집전화/IPTV) > 일시 정지/해제
 * FileName: myt-join.wire.set.pause.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.16
 * Summary: 일시 정지/해제 정보 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_WIRE_SET_PAUSE } from '../../../../types/string.type';

class MyTJoinWireSetPause extends TwViewController {
  private _VIEW: any = {
    DEFAULT: 'wire/myt-join.wire.set.pause.html'
  };
  private _INPUT_FORMAT: string = 'YYYY-MM-DD';
  private _SELECTABLE_MAX_DAY: number = 30; // 정지시작일 선택가능 기간(일)
  private _DAYS_PER_MONTH: number = 31; // 1개월 추정 일 수

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqWirePauseInfo()
    ).subscribe(([wirePauseInfoResp]) => {
      const apiError = this.error.apiError([
        wirePauseInfoResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const wirePauseInfo = this.getWirePauseInfo(wirePauseInfoResp);
      // console.log('~~~~~~~~~~~`wirePauseInfo', wirePauseInfo);
      const today = new Date();
      // 정지 시작일 당일로 세팅
      const min = DateHelper.getShortDateWithFormat( DateHelper.getCurrentDate(), this._INPUT_FORMAT );
      // 정지 시작 가능일 세팅(당일 ~ 30일 이내)
      const startDate = {
        min: min,
        max: DateHelper.getShortDateWithFormatAddByUnit(today, this._SELECTABLE_MAX_DAY, 'days', this._INPUT_FORMAT),
      };
      const options = {
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {},
        wirePauseInfo: wirePauseInfo || {},
        startDate: startDate || {},
        isBroadbandJoined: 'N'
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  /**
   * 인터넷/집전화/IPTV > 일시정지/해제 신청내역 조회
   * @private
   * return Observable
   */
  private reqWirePauseInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0169, {});
  }

  /**
   * 일시정지/해제 신청내역 데이터 가공 후 반환
   * @param resp
   * @private
   * return wirePauseInfo{Object}
   */
  private getWirePauseInfo(resp: any): any {
    const wirePauseInfo = resp.result && resp.result.pauseInfo;
    // wirePauseInfo['svc_st_cd'] = 'SP';
    // wirePauseInfo['svc_st_nm'] = '일시 정지';
    // wirePauseInfo['last_susp_dt_fr'] = '20181019';
    // wirePauseInfo['last_susp_dt_to'] = '20181120';

    // 일시정지 해제 신청이 있는 경우 이용정지 기간 정보 가공
    if ( wirePauseInfo['last_susp_dt_fr'] && wirePauseInfo['last_susp_dt_to'] ) {
      const refDiffDays = DateHelper.getDiffByUnit(wirePauseInfo['last_susp_dt_to'], wirePauseInfo['last_susp_dt_fr'], 'days');
      const diffMonth = Math.floor(refDiffDays / this._DAYS_PER_MONTH);
      let diffDays = refDiffDays;
      let rangeStr = '';
      if ( !!diffMonth ) {
        rangeStr = diffMonth + MYT_JOIN_WIRE_SET_PAUSE.MONTH;
        diffDays = refDiffDays % this._DAYS_PER_MONTH;
      }
      if ( !!diffDays ) {
        rangeStr += diffDays + MYT_JOIN_WIRE_SET_PAUSE.DAY;
      }
      wirePauseInfo['pause_range'] = rangeStr;
      wirePauseInfo['showLastSuspDtFr'] = DateHelper.getShortDate(wirePauseInfo['last_susp_dt_fr']);
      wirePauseInfo['showLastSuspDtTo'] = DateHelper.getShortDate(wirePauseInfo['last_susp_dt_to']);
    }
    return wirePauseInfo;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    if (err.code === 'MOD0031') { // SK브로드밴드 가입자
      return res.render(this._VIEW.DEFAULT, {
        svcInfo,
        pageInfo,
        wirePauseInfo: {},
        startDate: {},
        isBroadbandJoined: 'Y'
      });
    }
    return this.error.render(res, {
      title: MYT_JOIN_WIRE_SET_PAUSE.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo,
      svcInfo
    });
  }

}

export default MyTJoinWireSetPause;
