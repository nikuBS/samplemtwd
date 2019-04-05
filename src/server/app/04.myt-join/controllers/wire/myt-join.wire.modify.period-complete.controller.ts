/**
 * FileName: myt-join.wire.modify.period-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.12.7
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTJoinWireModifyPeriodComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('wire/myt-join.wire.modify.period-complete.html', { pageInfo });
  }

}

export default MyTJoinWireModifyPeriodComplete;
