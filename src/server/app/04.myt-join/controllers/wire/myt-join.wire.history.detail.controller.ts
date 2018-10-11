/**
 * FileName: myt-join.wire.history.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';


class MyTJoinWireHistoryDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('wire/myt-join.wire.history.detail.html', {});
  }
}

export default MyTJoinWireHistoryDetail;

