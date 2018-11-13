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
import { MYT_JOIN_SUSPEND } from '../../../../types/title.type';
import StringHelper from '../../../../utils/string.helper';
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
        phoneNum: StringHelper.phoneStringToDash(svcInfo.svcNum)
      };

      if ( suspendStatus.result.svcStCd === 'SP' ) {
        const from = DateHelper.getShortDateWithFormat(suspendStatus.result.fromDt, 'YYYY-MM-DD');
        const to = DateHelper.getShortDateWithFormat(suspendStatus.result.toDt, 'YYYY-MM-DD');
        options['period'] = { from, to };
        options['reason'] = suspendStatus.result.svcChgRsnNm;

        if ( suspendStatus.result.svcChgRsnCd === 21
          || suspendStatus.result.svcChgRsnCd === 22 ) { // 일시정지(case 1)
          options['type'] = 'temporary';
        } else { // 장기일시정지(case 6)
          options['type'] = 'long-term';
        }
        res.render('suspend/myt-join.suspend.status.html', options);
      } else {

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
        res.render('suspend/myt-join.suspend.html', options);
      }

    });
  }

}

export default MyTJoinSuspendStatus;
