/**
 * FileName: customer.agentsearch.near.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

class CustomerAgentsearchNear extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('agentsearch/customer.agentsearch.near.html', { svcInfo, pageInfo });
  }
}

export default CustomerAgentsearchNear;
