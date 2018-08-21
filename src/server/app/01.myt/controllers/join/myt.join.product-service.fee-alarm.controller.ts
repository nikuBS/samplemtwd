/**
 * FileName: myt.join.product-service.fee-alarm.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.16
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MytJoinProductServiceFeeAlarmController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('join/myt.join.product-service.fee-alarm.html', {
      svcInfo: svcInfo
    });
  }
}

export default MytJoinProductServiceFeeAlarmController;