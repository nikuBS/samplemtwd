/**
 * FileName: myt-join.mgmt.numchg.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTJoinMgmtNumChg extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('management/myt-join.mgmt.numchg.html', { svcInfo: svcInfo });
  }
}

export default MyTJoinMgmtNumChg;

