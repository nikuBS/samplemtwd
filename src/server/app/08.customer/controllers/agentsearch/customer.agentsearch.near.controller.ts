/**
 * FileName: customer.agentsearch.near.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class CustomerAgentsearchNear extends TwViewController {
  render(req: Request, res: Response) {
    res.render('agentsearch/customer.agentsearch.near.html');
  }
}

export default CustomerAgentsearchNear;
