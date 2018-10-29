/**
 * FileName: customer.branch.search.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.10.16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class CustomerBranchSearch extends TwViewController {
  render(req: Request, res: Response) {
    res.render('branch/customer.branch.search.html');
  }
}

export default CustomerBranchSearch;
