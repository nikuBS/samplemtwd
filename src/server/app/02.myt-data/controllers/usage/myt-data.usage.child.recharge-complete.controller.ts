/**
 * FileName: myt-data.usage.child.recharge-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.12.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MytDataUsageChildRechargeComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('usage/myt-data.usage.child.recharge-complete.html', { pageInfo });
  }

}

export default MytDataUsageChildRechargeComplete;
