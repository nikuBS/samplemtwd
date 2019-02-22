/**
 * FileName: myt-join.myplan.alarm.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTJoinMyplanAlarm extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
      return this.error.render(res, {
        title: '요금제 변경 가능일 알람',
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }

    this.apiService.request(API_CMD.BFF_05_0125, {}, {})
      .subscribe((alarmInfo) => {
        if (alarmInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo: svcInfo,
            code: alarmInfo.code,
            msg: alarmInfo.msg,
            title: '요금제 변경 가능일 알람'
          });
        }

        res.render('myplan/myt-join.myplan.alarm.html', {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          alarmInfo: alarmInfo.result
        });
      });
  }
}

export default MyTJoinMyplanAlarm;
