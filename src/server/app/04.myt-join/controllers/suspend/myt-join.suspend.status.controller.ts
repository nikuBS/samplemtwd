/**
 * FileName: myt-join.suspend.status.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 12.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import { MYT_SUSPEND_ERROR_MSG, MYT_SUSPEND_REASON, MYT_SUSPEND_STATE_EXCLUDE } from '../../../../types/string.type';
import { MYT_JOIN_SUSPEND } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTJoinSuspendStatus extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0149, {}),
      this.apiService.request(API_CMD.BFF_05_0194, {})
    ).subscribe(([suspendStatus, progress]) => {
      const apiError = this.error.apiError([suspendStatus]);
      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          msg: apiError.msg,
          code: apiError.code
        });
      }

      const options = {
        svcInfo,
        pageInfo,
        phoneNum: svcInfo ? StringHelper.phoneStringToDash(svcInfo.svcNum) : ''
      };

      const status = {};
      if ( suspendStatus.result.svcStCd === 'SP' ) {
        const from = DateHelper.getShortDateWithFormat(suspendStatus.result.fromDt, 'YYYY.M.D.');
        const to = DateHelper.getShortDateWithFormat(suspendStatus.result.toDt, 'YYYY.M.D.');
        status['period'] = { from, to };
        status['reason'] = suspendStatus.result.svcChgRsnNm.replace( MYT_SUSPEND_STATE_EXCLUDE , '');
        status['resuspend'] = null; // 재신청중인 사용자 -> 재신청취소 버튼 노출
        status['resuspendDt'] = null; // 재신청일자
        status['resetable'] = true;
        status['resuspendable'] = false; // 장기일시정지(군입대) 일시해제 경우 재싱청 버튼 노출
        status['militaryAC'] = false;
        if ( suspendStatus.result.svcChgRsnCd === '21'
          || suspendStatus.result.svcChgRsnCd === '22' ) { // 장기일시정지(case 6)
          status['type'] = 'long-term';
          // status['resuspendable'] = true;
          if ( suspendStatus.result.reFormDt ) { // 장기일시정지(case 7)
            status['resuspendDt'] = DateHelper.getShortDateWithFormat(suspendStatus.result.reFormDt, 'YYYY.M.D.');
          } else if ( suspendStatus.result.svcChgRsnCd === '21' ) {
            const months = DateHelper.getDiffByUnit(DateHelper.getCurrentDate(), suspendStatus.result.fromDt, 'months');
            if ( months >= 23 ) {
              status['resuspendable'] = false;
            }
          }
          if ( suspendStatus.result.cntcNum ) {
            suspendStatus.result.cntcNum = StringHelper.phoneStringToDash(suspendStatus.result.cntcNum);
          }
        } else { // 일시정지(case 1)
          status['type'] = 'temporary';
        }
        options['status'] = status;
      } else if ( this._militaryAC(suspendStatus.result) ) { // 군입대 장기일시정지자의 중도 해제 중
        const from = DateHelper.getShortDateWithFormat(suspendStatus.result.fromDt, 'YYYY.M.D.');
        const to = DateHelper.getShortDateWithFormat(suspendStatus.result.toDt, 'YYYY.M.D.');
        status['period'] = { from, to };
        status['reason'] = MYT_SUSPEND_REASON['5000341'];
        status['type'] = 'long-term';
        status['resetable'] = false;
        status['militaryAC'] = true;
        if ( suspendStatus.result.reFromDt && suspendStatus.result.reFromDt !== '' ) {
          status['resuspend'] = true;
          status['resuspendDt'] = DateHelper.getShortDateWithFormat(suspendStatus.result.reFormDt, 'YYYY.M.D.');
        } else {
          status['resuspendable'] = true;
        }
        options['status'] = status;
      } else {
        options['status'] = null;
      }

      // 진행사항에 대항 표시
      if ( progress.code === API_CODE.CODE_00 ) { //  현재 장기일시 정지 미신청 상태에 대한 코드가 없음
        const _progress = progress.result;
        if ( options['status'] && status['militaryAC'] ) {
          options['progress'] = null;
          options['status']['isProgressing'] = false;
        } else {
          _progress.rgstDt = DateHelper.getShortDateWithFormat(_progress.rgstDt, 'YYYY.M.D.');
          _progress.opDtm = _progress.opDtm ? DateHelper.getShortDateWithFormat(_progress.opDtm, 'YYYY.M.D.') : '';
          // DV001-18322 스윙 문구 고객언어 반영
          _progress.state = _progress.opState.replace( MYT_SUSPEND_STATE_EXCLUDE, ''); // MYT_SUSPEND_STATE[_progress.opStateCd];
          _progress.fromDt = DateHelper.getShortDateWithFormat(_progress.fromDt, 'YYYY.M.D.');
          _progress.progressReason = MYT_SUSPEND_REASON[_progress.receiveCd];
          if ( _progress.toDt ) {
            _progress.toDt = DateHelper.getShortDateWithFormat(_progress.toDt, 'YYYY.M.D.');
          }
          options['progress'] = _progress;
          if ( options['status'] ) {
            options['status']['isProgressing'] = true;
          }
        }
        if ( _progress.cntcNum ) {
          _progress.cntcNum = StringHelper.phoneStringToDash(_progress.cntcNum);
        }
      } else if ( progress.debugMessage && progress.debugMessage.trim() === '500' ) {
        options['progress'] = null;
        if ( options['status'] ) {
          options['status']['isProgressing'] = false;
        }
      } else {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          msg: progress.msg,
          code: progress.code
        });
      }

      if ( !options['progress'] && !options['status'] ) {
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

  _militaryAC(suspendStatus: any): boolean {
    if ( suspendStatus.svcStCd === 'AC' && suspendStatus.armyDt && suspendStatus.armyDt !== '' ) {
      const days = DateHelper.getDiffByUnit(suspendStatus.toDt, DateHelper.getCurrentDate(), 'days');
      if ( days > 0 ) {
        return true;
      }
    }
    return false;
  }
}

export default MyTJoinSuspendStatus;
