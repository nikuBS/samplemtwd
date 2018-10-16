/**
 * FileName: myt-join.suspend.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTJoinSuspend extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any) {
    res.render('suspend/myt-join.suspend.html', {
      svcInfo: svcInfo,
      lines: [],
      billAvailable: false
    });
  }
}

export default MyTJoinSuspend;