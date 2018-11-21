/**
 * FileName: myt-join.suspend.status.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 12.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import { MYT_SUSPEND_STATE } from '../../../../types/string.type';

class MyTJoinSuspendStatus extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0149, {}),
      this.apiService.request(API_CMD.BFF_05_0194, {})
    ).subscribe(([suspendStatus, progress]) => {

      // const apiError = this.error.apiError([suspendStatus, progress]);
      // if ( !FormatHelper.isEmpty(apiError) ) {
      //   return this.error.render(res, {
      //     title: MYT_JOIN_SUSPEND.STATE,
      //     svcInfo: svcInfo,
      //     msg: apiError.msg,
      //     code: apiError.code
      //   });
      // }

      const options = {
        svcInfo,
        pageInfo,
        phoneNum: svcInfo ?  StringHelper.phoneStringToDash(svcInfo.svcNum) : ''
      };

      if ( suspendStatus.result.svcStCd === 'SP' ) {
        const from = DateHelper.getShortDateWithFormat(suspendStatus.result.fromDt, 'YYYY-MM-DD');
        const to = DateHelper.getShortDateWithFormat(suspendStatus.result.toDt, 'YYYY-MM-DD');
        options['period'] = { from, to };
        options['reason'] = suspendStatus.result.svcChgRsnNm;
        options['resuspend'] = null;
        if ( false && (suspendStatus.result.svcChgRsnCd === 21
          || suspendStatus.result.svcChgRsnCd === 22) ) { // 일시정지(case 1)
          options['type'] = 'temporary';
        } else { // 장기일시정지(case 6)
          options['type'] = 'long-term';
          // suspendStatus.result.reFormDt = '2020.02.02';
          if ( suspendStatus.result.reFormDt ) { // 장기일시정지(case 7)
            options['resuspend'] = DateHelper.getShortDateWithFormat(suspendStatus.result.reFormDt, 'YYYY-MM-DD');
          }
        }
        res.render('suspend/myt-join.suspend.status.html', options);
      } else {
        options['suspend'] = progress.result;
        options['suspend'].rgstDt = DateHelper.getShortDateWithFormat(options['suspend'].rgstDt, 'YYYY-MM-DD');
        options['suspend'].opDtm = DateHelper.getShortDateWithFormat(options['suspend'].opDtm, 'YYYY-MM-DD');
        options['suspend'].state = MYT_SUSPEND_STATE[options['suspend'].opStateCd];
        switch ( progress.result.opStateCd ) {
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
        res.render('suspend/myt-join.suspend.progress.html', options);
      }

    });
  }

}

export default MyTJoinSuspendStatus;
