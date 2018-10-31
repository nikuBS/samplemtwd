/**
 * FileName: customer.branch.near.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class CustomerBranchNear extends TwViewController {
  render(req: Request, res: Response) {
    res.render('branch/customer.branch.near.html');
  }
}

export default CustomerBranchNear;
