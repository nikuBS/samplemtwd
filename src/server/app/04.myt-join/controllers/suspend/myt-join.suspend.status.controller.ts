/**
 * FileName: myt-join.suspend.status.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 12.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import { MYT_SUSPEND_STATE, MYT_SUSPEND_ERROR_MSG, MYT_SUSPEND_REASON } from '../../../../types/string.type';
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
          msg: apiError.msg,
          code: apiError.code
        });
      }

      const options = {
        svcInfo,
        pageInfo,
        phoneNum: svcInfo ? StringHelper.phoneStringToDash(svcInfo.svcNum) : ''
      };

      if ( suspendStatus.result.svcStCd === 'SP' ) {
        const status = {};
        const from = DateHelper.getShortDateWithFormat(suspendStatus.result.fromDt, 'YYYY.MM.DD.');
        const to = DateHelper.getShortDateWithFormat(suspendStatus.result.toDt, 'YYYY.MM.DD.');
        status['period'] = { from, to };
        status['reason'] = suspendStatus.result.svcChgRsnNm;
        status['resuspend'] = null;

        if ( suspendStatus.result.svcChgRsnCd === '21'
          || suspendStatus.result.svcChgRsnCd === '22' ) { // 장기일시정지(case 6)
          status['type'] = 'long-term';
          status['resuspendable'] = true;
          if ( suspendStatus.result.reFormDt ) { // 장기일시정지(case 7)
            status['resuspend'] = DateHelper.getShortDateWithFormat(suspendStatus.result.reFormDt, 'YYYY.MM.DD.');
          } else if ( suspendStatus.result.svcChgRsnCd === '21' ) {
            const months = DateHelper.getDiffByUnit(DateHelper.getCurrentDate(), suspendStatus.result.fromDt, 'months');
            if ( months >= 23 ) {
              status['resuspendable'] = false;
            }
          }
        } else { // 일시정지(case 1)
          status['type'] = 'temporary';
        }
        options['status'] = status;
      } else {
        options['status'] = null;
      }
      if ( progress.code === API_CODE.CODE_00 ) { //  현재 장기일시 정지 미신청 상태에 대한 코드가 없음
        const _progress = progress.result;
        _progress.rgstDt = DateHelper.getShortDateWithFormat(_progress.rgstDt, 'YYYY.MM.DD.');
        _progress.opDtm = _progress.opDtm ? DateHelper.getShortDateWithFormat(_progress.opDtm, 'YYYY.MM.DD.') : '';
        _progress.state = MYT_SUSPEND_STATE[_progress.opStateCd];
        _progress.fromDt = DateHelper.getShortDateWithFormat(_progress.fromDt, 'YYYY.MM.DD.');

        _progress.progressReason = MYT_SUSPEND_REASON[_progress.receiveCd];
        if ( _progress.toDt ) {
          _progress.toDt = DateHelper.getShortDateWithFormat(_progress.toDt, 'YYYY.MM.DD.');
        }
        options['progress'] = _progress;
        if ( options['status'] ) {
          options['status']['isProgressing'] = true;
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
          msg: progress.msg,
          code: progress.code
        });
      }

      if ( !options['progress'] && !options['status'] ) {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          msg: MYT_SUSPEND_ERROR_MSG.NOT_SUSPENDED
        });
      }
      res.render('suspend/myt-join.suspend.status.html', options);

    });
  }
}

export default MyTJoinSuspendStatus;
