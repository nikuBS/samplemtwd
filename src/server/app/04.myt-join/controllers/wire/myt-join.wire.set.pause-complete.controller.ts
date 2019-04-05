/**
 * FileName: myt-join.wire.set.pause-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.12.7
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { MYT_JOIN_WIRE_SET_PAUSE } from '../../../../types/string.type';

class MyTJoinWireSetPauseComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const svcStCd = req.query.svcStCd;

    res.render('wire/myt-join.wire.set.pause-complete.html', {
      completeTxt: MYT_JOIN_WIRE_SET_PAUSE[svcStCd],
      pageInfo
    });
  }

}

export default MyTJoinWireSetPauseComplete;
