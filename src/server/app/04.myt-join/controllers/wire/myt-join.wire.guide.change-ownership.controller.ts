/**
 * FileName: myt-join.wire.guide.change-ownership.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP } from '../../../../types/string.type';

class MyTJoinWireGuideChangeOwnership extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
      return this.error.render(res, {
        title: MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP.TITLE,
        svcInfo,
        pageInfo
      });
    }

    res.render('wire/myt-join.wire.guide.change-ownership.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default MyTJoinWireGuideChangeOwnership;
