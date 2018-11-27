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
import { MYT_SUSPEND_STATE, MYT_SUSPEND_ERROR_MSG } from '../../../../types/string.type';
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
        if ( suspendStatus.result.svcChgRsnCd === 21
          || suspendStatus.result.svcChgRsnCd === 22 ) { // 장기일시정지(case 6)
          status['type'] = 'long-term';
          if ( suspendStatus.result.reFormDt ) { // 장기일시정지(case 7)
            status['resuspend'] = DateHelper.getShortDateWithFormat(suspendStatus.result.reFormDt, 'YYYY.MM.DD.');
          }
        } else { // 일시정지(case 1)
          status['type'] = 'temporary';
        }
        options['status'] = status;
      } else {
        options['status'] = null;
      }

      /* tslint:disable */

      progress = {
        'code': '00',
        'msg': '',
        'result': {
          'seq': '222',
          // 'opStateCd': 'R',
          // 'opState: '접수중',
          // 'opStateCd': 'D',
          // 'opState': '서류확인',
          // 'opStateCd': 'A',
          // 'opState':'서류확인중',
          // 'opStateCd': 'F',
          // 'opState': '서류확인중',
          'opStateCd': 'C',
          'opState': '처리완료',
          'opReasonCd': '30',
          'opReason': '구비서류미비',
          'opDtm': '20181001122000',
          'reasonCd': '??',
          'reason': '군입대',
          'receiveCd': '??',
          'receive': '걸기/받기 모두 정지',
          'rgstDt': '20180901',
          'fromDt': '20181231',
          'toDt': '20201231',
          'attFileList': [
            {
              'seq': '001',
              'fileName': 'adfads.gif',
              'auditDtm': '20181011'
            },
            {
              'seq': '001',
              'fileName': 'adfads.gif',
              'auditDtm': '20181011'
            }
          ],
          'cntcNumRelNm': '친구',
          'cntcNum': '222'
        }
      };

      /* tslint:enable */
      if ( progress.code === API_CODE.CODE_00 ) { //  현재 장기일시 정지 미신청 상태에 대한 코드가 없음
        const _progress = progress.result;
        _progress.rgstDt = DateHelper.getShortDateWithFormat(_progress.rgstDt, 'YYYY.MM.DD.');
        _progress.opDtm = DateHelper.getShortDateWithFormat(_progress.opDtm, 'YYYY.MM.DD.');
        _progress.state = MYT_SUSPEND_STATE[_progress.opStateCd];
        _progress.fromDt = DateHelper.getShortDateWithFormat(_progress.fromDt, 'YYYY.MM.DD.');

        if ( _progress.toDt ) {
          _progress.toDt = DateHelper.getShortDateWithFormat(_progress.toDt, 'YYYY.MM.DD.');
        }
        switch ( _progress.opStateCd ) {
          case 'R': // 접수중(case 2)
          case 'D': // 서류접수중
            break;
          case 'A': // 서류재첨부필요(case 3)
            break;
          case 'F': // 처리불가(case 4)
            break;
          case 'C': // 처리완료(case 5)
            break;
        }
        options['progress'] = _progress;
        options['status'].isProgressing = true;
      } else if ( progress.debugMessage.trim() === '404' ) {
        options['progress'] = null;
        options['status'].isProgressing = false;
      } else {
        this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          msg: apiError.msg,
          code: apiError.code
        });
      }

      if ( !options['progress'] && !options['status'] ) {
        this.error.render(res, {
          title: MYT_JOIN_SUSPEND.STATE,
          svcInfo: svcInfo,
          msg: MYT_SUSPEND_ERROR_MSG.NOT_SUSPENDED
        });
        return;
      }
      res.render('suspend/myt-join.suspend.status.html', options);

    });
  }
}

export default MyTJoinSuspendStatus;
