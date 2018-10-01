/**
 * FileName: myt.join.product-service.fee-alarm.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.16
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTJoinProductServiceFeeAlarm extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
      return this.error.render(res, {
        title: '요금제 변경 가능일 알림 서비스',
        svcInfo: svcInfo
      });
    }

    res.render('join/myt.join.product-service.fee-alarm.html', {
      svcInfo: svcInfo
    });
  }
}

export default MyTJoinProductServiceFeeAlarm;
