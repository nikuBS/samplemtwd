/**
 * @file customer.praise.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.22
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class CustomerPraise extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('praise/customer.praise.html', { svcInfo, pageInfo });
  }
}
