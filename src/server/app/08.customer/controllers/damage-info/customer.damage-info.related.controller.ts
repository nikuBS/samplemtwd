/**
 * FileName: customer.damage-info.related.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_PROTECT_RELATE_ORG, CUSTOMER_PROTECT_REPORT_ORG } from '../../../../types/outlink.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerDamageInfoRelated extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('damage-info/customer.damage-info.related.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      outlinkReport: CUSTOMER_PROTECT_REPORT_ORG,
      outlinkRelate: CUSTOMER_PROTECT_RELATE_ORG
    });
  }
}

export default CustomerDamageInfoRelated;
