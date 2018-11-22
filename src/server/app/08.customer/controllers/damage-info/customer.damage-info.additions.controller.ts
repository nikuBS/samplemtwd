/**
 * FileName: customer.damage-info.additions.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerDamageInfoAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('damage-info/customer.damage-info.additions.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    });
  }
}

export default CustomerDamageInfoAdditions;
