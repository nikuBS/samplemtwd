/**
 * FileName: customer.preventdamage.guideview.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerPreventdamageGuideviewController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('preventdamage/customer.preventdamage.guideview.html', {
      svcInfo: svcInfo
    });
  }
}

export default CustomerPreventdamageGuideviewController;
