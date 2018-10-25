/**
 * FileName: myt-join.mgmt.numchg-alarm.ext.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTJoinMgmtNumChgAlarmExt extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('management/myt-join.mgmt.numchg-.alarm.html', { svcInfo: svcInfo });
  }
}

export default MyTJoinMgmtNumChgAlarmExt;

