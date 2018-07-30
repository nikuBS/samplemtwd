/**
 * FileName: customer.preventdamage.relatesite.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_PREVENTDAMAGE_RELATE_ORG, CUSTOMER_PREVENTDAMAGE_REPORT_ORG } from '../../../../types/outlink.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerPreventdamageRelatesiteController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('preventdamage/customer.preventdamage.relatesite.html', {
      svcInfo: svcInfo,
      outlinkReport: CUSTOMER_PREVENTDAMAGE_REPORT_ORG,
      outlinkRelate: CUSTOMER_PREVENTDAMAGE_RELATE_ORG
    });
  }
}

export default CustomerPreventdamageRelatesiteController;
