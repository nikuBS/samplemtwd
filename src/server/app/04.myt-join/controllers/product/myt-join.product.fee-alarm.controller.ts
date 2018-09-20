/**
 * FileName: myt-join.product.fee-alarm.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTJoinProductFeeAlarm extends TwViewController {
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

    res.render('product/myt-join.product-service.fee-alarm.html', {
      svcInfo: svcInfo
    });
  }
}

export default MyTJoinProductFeeAlarm;
