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

    // res.render('management/myt-join.mgmt.numchg-alarm.html', { svcInfo: svcInfo, pageInfo: pageInfo, data: { numGuidOptYn : 'Y' } });

    // this.apiService.request(API_CMD.BFF_05_0180, {})
    //   .subscribe((resp) => {
        const resp = {
          'code': '00',
          'msg': '결과메세지',
          'result':
            {
              'oldSvcNum': '01056**78**',
              'newSvcNum': '01012**34**',
              'notiType': 'S',
              'freeOfrEndDt': '20191030',
              'notiStaDt': '20181031',
              'notiEndDt': '20190331',
              'extnsPsblYn': 'N',
              'orglSktYn': 'Y'
            }
        };
        

        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result};
          res.render('management/myt-join.mgmt.numchg-alarm.html', option);
        }
      // });
      

  }
}

export default MyTJoinMgmtNumChgAlarm;

