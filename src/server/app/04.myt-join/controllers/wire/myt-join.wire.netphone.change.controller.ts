/**
 * FileName: myt-join.wire.inetphone-num.change.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireInetPhoneNumChange extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const option = { svcInfo: svcInfo };
    res.render('wire/myt-join.wire.inetphone-num.change.html', {});
  }
}

export default MyTJoinWireInetPhoneNumChange;

