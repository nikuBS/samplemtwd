/**
 * FileName: customer.agentsearch.repair-manufacturer.controller.ts (CS_03_03)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.11.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerAgentsearchRepairManufacturer extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any): void {
    res.render('agentsearch/customer.agentsearch.repair-manufacturer.html');
  }
}

export default CustomerAgentsearchRepairManufacturer;
