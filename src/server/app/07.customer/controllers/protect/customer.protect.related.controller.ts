/**
 * FileName: customer.protect.related.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_PROTECT_RELATE_ORG, CUSTOMER_PROTECT_REPORT_ORG } from '../../../../types/outlink.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerProtectRelated extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('protect/customer.protect.related.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      outlinkReport: CUSTOMER_PROTECT_REPORT_ORG,
      outlinkRelate: CUSTOMER_PROTECT_RELATE_ORG
    });
  }
}

export default CustomerProtectRelated;
