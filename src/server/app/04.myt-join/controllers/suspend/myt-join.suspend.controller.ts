/**
 * [나의 가입정보 - 장기/일시정지] 관련 처리
 * @author Hyeryoun Lee
 * @since 2018-10-15
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { MYT_JOIN_SUSPEND } from '../../../../types/title.type';
import StringHelper from '../../../../utils/string.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import { MYT_SUSPEND_STATE_EXCLUDE } from '../../../../types/string.type';
/**
 * [나의 가입정보 - 장기/일시정지] API호출 및 렌더링
 * @author Hyeryoun Lee
 * @since 2018-10-15
 */
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
        const today = DateHelper.getCurrentDateTime('YYYY-MM-DD');
        const after3Months = DateHelper.getShortDateWithFormatAddByUnit(today, 3, 'months', 'YYYY-MM-DD');
        const after24Months = DateHelper.getShortDateWithFormatAddByUnit(today, 24, 'months', 'YYYY-MM-DD');
        options['suspend'] = {
          today: today,
          threeMonths: after3Months,
          twoYears: after24Months
        };

        if ( suspendState.result.svcStCd === 'SP' ) {// suspended
          const result = suspendState.result;
          const from = DateHelper.getShortDateWithFormat(result.fromDt, 'YYYY-MM-DD');
          const to = DateHelper.getShortDateWithFormat(result.toDt, 'YYYY-MM-DD');
          options['suspend'].period = { from, to };
          options['suspend'].reason = result.svcChgRsnNm.replace( MYT_SUSPEND_STATE_EXCLUDE , '');
          options['suspend'].status = true;
        } else {
          options['suspend'].status = false;
        }
      } else {
        return this.error.render(res, {
          title: MYT_JOIN_SUSPEND.MAIN,
          msg: suspendState.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code: suspendState.code
        });
      }
      res.render('suspend/myt-join.suspend.html', options);
    });
  }
}
export default MyTJoinSuspend;
