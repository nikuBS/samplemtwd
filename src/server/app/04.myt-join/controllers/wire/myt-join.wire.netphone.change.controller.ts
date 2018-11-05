/**
 * FileName: myt-join.wire.netphone-num.change.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';


class MyTJoinWireInetPhoneNumChange extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
      return this.error.render(res, {
        title: MYT_JOIN_WIRE.NETPHONE_CHANGE.TITLE,
        svcInfo: svcInfo
      });
    }
    res.render('wire/myt-join.wire.inetphone-num.change.html', {svcInfo: svcInfo, pageInfo: pageInfo});
  }
}

export default MyTJoinWireInetPhoneNumChange;

