/**
 * FileName: customer.email.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerEmailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const status = req.params.status;
    const email = req.query.email ? req.query.email : '';

    if ( status === 'complete' ) {
      res.render('email/customer.email.complete.html', {
        svcInfo: svcInfo,
        type: req.query.type,
        email: email
      });
    } else {
      res.render('email/customer.email.html', {
        svcInfo: svcInfo,
        type: req.query.type
      });
    }
  }
}

export default CustomerEmailController;
