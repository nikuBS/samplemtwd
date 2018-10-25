/**
 * FileName: myt-join.suspend.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { MYT_JOIN_SUSPEND } from '../../../../types/title.type';
import StringHelper from '../../../../utils/string.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTJoinSuspend extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0149, {})
    ).subscribe(([suspendState]) => {
      const options = {
        svcInfo,
        pageInfo,
        phoneNum: StringHelper.phoneStringToDash(svcInfo.svcNum),
        isApp: BrowserHelper.isApp(req)
      };

      if ( suspendState.code === API_CODE.CODE_00 ) {
        if ( suspendState.result.svcStCd === 'SP' ) {// suspended
          const result = suspendState.result;
          const from = DateHelper.getShortDateWithFormat(result.fromDt, 'YYYY-MM-DD');
          const to = DateHelper.getShortDateWithFormat(result.toDt, 'YYYY-MM-DD');
          options['suspend'] = {
            status: true,
            reason: result.reason,
            period: { from, to }
          };
        } else {
          const from = DateHelper.getCurrentDateTime('YYYY-MM-DD');
          const to = DateHelper.getShortDateWithFormatAddByUnit(from, 3, 'months', 'YYYY-MM-DD');
          options['suspend'] = {
            status: false,
            period: { from, to }
          };
        }
      } else {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.MAIN,
          msg: suspendState.msg,
          svcInfo: svcInfo,
          code: suspendState.code
        });
      }
      res.render('suspend/myt-join.suspend.html', options);
    });
  }

}

export default MyTJoinSuspend;
