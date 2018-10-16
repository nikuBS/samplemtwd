/**
 * FileName: myt-join.suspend.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinSuspend extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any) {
    const from = DateHelper.getCurrentDateTime('YYYY-MM-DD');
    const to = DateHelper.getShortDateWithFormatAddByUnit(from, 3, 'months', 'YYYY-MM-DD');

    res.render('suspend/myt-join.suspend.html', {
      svcInfo: svcInfo,
      lines: [],
      billAvailable: false,
      period: { from, to },
      suspended: false
    });
  }
}

export default MyTJoinSuspend;
