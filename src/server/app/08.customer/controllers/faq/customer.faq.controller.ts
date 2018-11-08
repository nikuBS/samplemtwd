/**
 * FileName: customer.faq.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class CustomerFaq extends TwViewController {
  render(req: Request, res: Response) {
    res.render('faq/customer.faq.html');
  }
}

export default CustomerFaq;
