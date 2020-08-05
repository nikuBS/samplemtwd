/**
 * [나의 가입정보 - 장기/일시정지 현황] 관련 처리
 * @author Hyeryoun Lee
 * @since 2018-11-12
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import {MYT_SUSPEND_REASON_CODE} from '../../../../types/bff.type';
import {MYT_SUSPEND_ERROR_MSG, MYT_SUSPEND_REASON, MYT_SUSPEND_STATE_EXCLUDE} from '../../../../types/string.type';
import {MYT_JOIN_SUSPEND} from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * [나의 가입정보 - 장기/일시정지 현황]  API호출 및 렌더링
 * @author Hyeryoun Lee
 * @since 2018-11-12
 */
class MyTJoinSuspendStatus extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
        this._getPausedState(),
        this._getLongPausedState()
    ).subscribe(([pausedStatus, longPausedStatus]) => {
      if (pausedStatus.code && API_CODE.CODE_00 !== pausedStatus.code) {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          msg: pausedStatus.msg,
          code: pausedStatus.code
        });
      }
      if (longPausedStatus.code && API_CODE.CODE_00 !== longPausedStatus.code && longPausedStatus.debugMessage !== '500') {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          msg: longPausedStatus.msg,
          code: longPausedStatus.code
        });
      }

      const options = {
        svcInfo,
        pageInfo,
        phoneNum: svcInfo ? StringHelper.phoneStringToDash(svcInfo.svcNum) : ''
      };

      const from = DateHelper.getShortDateWithFormat(pausedStatus.fromDt, 'YYYY.M.D.');
      // 해외체류 toDt 없음
      const to = pausedStatus.toDt ? DateHelper.getShortDateWithFormat(pausedStatus.toDt, 'YYYY.M.D.') : null;
      const status = {
        period: {from, to},
        resetable: true,
        // 2G 서비스 종료(svcChgRsnCd="55")인 경우, 정지 요청, 장시일시정지 요청 불가
        showButtons: pausedStatus.svcChgRsnCd !== '55'
      };
      if (pausedStatus.svcStCd === 'SP') { // 일시정지 상태
        //  const from = DateHelper.getShortDateWithFormat(pausedStatus.fromDt, 'YYYY.M.D.');
        // 해외체류 toDt 없음
        //  const to = pausedStatus.toDt ? DateHelper.getShortDateWithFormat(pausedStatus.toDt, 'YYYY.M.D.') : null;
        //  status['period'] = { from, to };
        status['reason'] = pausedStatus.svcChgRsnNm.replace(MYT_SUSPEND_STATE_EXCLUDE, '');
        status['resuspend'] = null; // 재신청중인 사용자 -> 재신청취소 버튼 노출
        status['resuspendDt'] = null; // 재신청일자
        status['resuspendable'] = false; // 장기일시정지(군입대) 일시해제 경우 재신청 버튼 노출
        status['militaryAC'] = false;
        status['reservedYn'] = false;
        if (pausedStatus.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.MILITARY
            || pausedStatus.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.OVERSEAS
            || pausedStatus.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.SEMI_MILITARY) { // 장기일시정지(case 6)
          status['type'] = 'long-term';
          // status['resuspendable'] = true;
          if (pausedStatus.reFormDt) { // 장기일시정지(case 7)
            status['resuspendDt'] = DateHelper.getShortDateWithFormat(pausedStatus.reFormDt, 'YYYY.M.D.');
          }

          if (pausedStatus.cntcNum) {
            pausedStatus.cntcNum = StringHelper.phoneStringToDash(pausedStatus.cntcNum);
          }
        } else { // 일시정지(case 1)
          status['type'] = 'temporary';
        }
        options['status'] = status;
      } else if (this._militaryAC(pausedStatus)) { // 군입대 장기일시정지자의 중도 해제 중
        //  const from = DateHelper.getShortDateWithFormat(pausedStatus.fromDt, 'YYYY.M.D.');
        // 해외체류 toDt 없음
        //   const to = pausedStatus.toDt ? DateHelper.getShortDateWithFormat(pausedStatus.toDt, 'YYYY.M.D.') : null;
        //   status['period'] = { from, to };
        status['reason'] = pausedStatus.armyExtDt ? MYT_SUSPEND_REASON['5000349'] /* 현역 외 */ : MYT_SUSPEND_REASON['5000341']; /* 현역 */
        status['type'] = 'long-term';
        status['resetable'] = false;
        status['militaryAC'] = true;
        // 장기일시정지 일시정지 재시작이 있을 경우
        if (pausedStatus.reFromDt && pausedStatus.reFromDt !== '') {
          status['resuspend'] = true;
          status['resuspendDt'] = DateHelper.getShortDateWithFormat(pausedStatus.reFormDt, 'YYYY.M.D.');
        } else {
          status['resuspendable'] = true;
          // DV001-21787 현역과 현역외의 장기일시정지의 일시해제가 동시 적용하는 경우에 대한 처리
          status['notallow_resuspend'] = false;
          if ((pausedStatus.armyDt && pausedStatus.armyDt !== '')
              && (pausedStatus.armyExtDt && pausedStatus.armyExtDt !== '')) {
            if (pausedStatus.armyDt === pausedStatus.armyExtDt) {
              status['notallow_resuspend'] = true;
            } else if (pausedStatus.armyExtDt < pausedStatus.armyDt) {
              status['reason'] = MYT_SUSPEND_REASON['5000341']; // 현역
            }
          }
        }
        options['status'] = status;
      } else if (pausedStatus.reservedYn === 'Y') { // 일시정지 예약자
        status['type'] = 'temporary';
        status['reason'] = MYT_SUSPEND_REASON['1000000'];
        status['reservedYn'] = true;
        options['status'] = status;
      } else {
        options['status'] = null;
      }

      // 진행사항에 대항 표시
      if (longPausedStatus.debugMessage === '500') {
        options['progress'] = null;
        if (options['status']) {
          options['status']['isProgressing'] = false;
        }
      } else { //  현재 장기일시 정지 미신청 상태에 대한 코드가 없음
        if (options['status'] && status['militaryAC']) {
          options['progress'] = null;
          options['status']['isProgressing'] = false;
        } else {
          longPausedStatus.rgstDt = DateHelper.getShortDateWithFormat(longPausedStatus.rgstDt, 'YYYY.M.D.');
          longPausedStatus.opDtm = longPausedStatus.opDtm ? DateHelper.getShortDateWithFormat(longPausedStatus.opDtm, 'YYYY.M.D.') : '';
          // DV001-18322 스윙 문구 고객언어 반영
          longPausedStatus.state = longPausedStatus.opState.replace(MYT_SUSPEND_STATE_EXCLUDE, ''); // MYT_SUSPEND_STATE[_progress.opStateCd];
          longPausedStatus.fromDt = DateHelper.getShortDateWithFormat(longPausedStatus.fromDt, 'YYYY.M.D.');
          // AC상태에서는 군입대 21, 해외체류 22 상태 정보가 세팅 안됨. receiveCd 참조 필요
          longPausedStatus.progressReason = MYT_SUSPEND_REASON[longPausedStatus.receiveCd];
          if (longPausedStatus.toDt) {
            longPausedStatus.toDt = DateHelper.getShortDateWithFormat(longPausedStatus.toDt, 'YYYY.M.D.');
          }
          options['progress'] = longPausedStatus;
          if (options['status']) {
            options['status']['isProgressing'] = true;
          }
        }
        if (longPausedStatus.cntcNum) {
          longPausedStatus.cntcNum = StringHelper.phoneStringToDash(longPausedStatus.cntcNum);
        }
      }

      if (!options['progress'] && !options['status']) {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          msg: MYT_SUSPEND_ERROR_MSG.NOT_SUSPENDED
        });
      }
      res.render('suspend/myt-join.suspend.status.html', options);
    });
  }

  /**
   * 장기일시정지(군입대)자의 일시정지 해제 체크
   * @param pausedStatus
   * @returns {boolean} 장기일시정지(군입대)자의 일시정지 해제 시 true
   */
  _militaryAC(pausedStatus: any): boolean {
    // 사용중(AC)이지만 armyDt 값으로 체크
    if (pausedStatus.svcStCd === 'AC') {
      if ((pausedStatus.armyDt && pausedStatus.armyDt !== '')
          || (pausedStatus.armyExtDt && pausedStatus.armyExtDt !== '')) {
        // 최초 장기일시정지 신청 기간 경과 체크
        const days = DateHelper.getDiffByUnit(pausedStatus.toDt, DateHelper.getCurrentDate(), 'days');
        if (days > 0) {
          return true;
        }
      }
    }
    return false;
  }

  // 일시정지/해제
  _getPausedState() {
    return this.apiService.request(API_CMD.BFF_05_0149, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return {
        code: resp.code,
        msg: resp.msg
      };
    });
  }

  // 장기 일시정지
  _getLongPausedState() {
    return this.apiService.request(API_CMD.BFF_05_0194, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      const result = {
        code: resp.code,
        msg: resp.msg
      };
      if (resp.debugMessage) {
        result['debugMessage'] = resp.debugMessage.trim();
      }
      return result;
    });
  }
}

export default MyTJoinSuspendStatus;
