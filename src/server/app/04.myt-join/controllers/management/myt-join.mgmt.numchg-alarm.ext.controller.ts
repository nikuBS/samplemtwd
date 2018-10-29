/**
 * FileName: myt-join.mgmt.numchg-alarm.ext.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinMgmtNumChgAlarmExt extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    // this.apiService.request(API_CMD.BFF_05_0180, {})
    //   .subscribe((resp) => {
        const resp = {
          'code': '00',
          'msg': '결과메세지',
          'result':
            {
              'curSvcNum': '0101234567',
              'guidReqSvcNum': '01098765432',
              'numGuidOptYn': 'S',
              'firstNumGuidStaDt': '',
              'wDateChargFrom': '',
              'numGuidStaDt': '20180101000000',
              'numGuidEndDt': '20181231000000',
              'bExtYN': 'Y',
              'offerBtnYn': 'Y'
            }
        };

        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          result['numGuidStaDt'] = DateHelper.getShortDateNoDot(result['numGuidStaDt']);
          result['numGuidEndDt'] = DateHelper.getShortDateNoDot(result['numGuidEndDt']);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result};
          res.render('management/myt-join.mgmt.numchg-alarm.ext.html', option);
        }
      // });

    // res.render('management/myt-join.mgmt.numchg-alarm.ext.html', { svcInfo: svcInfo, pageInfo : pageInfo });
  }
}

export default MyTJoinMgmtNumChgAlarmExt;

