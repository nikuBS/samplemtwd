/**
 * FileName: myt-join.mgmt.numchg-alarm.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTJoinMgmtNumChgAlarm extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    res.render('management/myt-join.mgmt.numchg-alarm.html', { svcInfo: svcInfo, data: { numGuidOptYn : 'Y' } });
    /*
    this.apiService.request(API_CMD.BFF_05_0180, {})
      .subscribe((resp) => {
        const result = resp.result;

        if ( resp.code === API_CODE.CODE_00 ) {
          const option = { svcInfo: svcInfo, data: result};
          res.render('management/myt-join.mgmt.numchg.alarm.html', { svcInfo: svcInfo });
        }
      });
      */

  }
}

export default MyTJoinMgmtNumChgAlarm;

