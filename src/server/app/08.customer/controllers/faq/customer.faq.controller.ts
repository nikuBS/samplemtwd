/**
 * @file customer.faq.controller.ts
 * @author Hakjoon sim
 * @since 2018-11-05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CustomerFaq extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    res.render('faq/customer.faq.html', { svcInfo, pageInfo });
  }
}

export default CustomerFaq;
