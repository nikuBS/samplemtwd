/**
 * @file 제조사 A/S 정보 화면 처리
 * @author Hakjoon Sim
 * @since 2018-11-01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerAgentsearchRepairManufacturer extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('agentsearch/customer.agentsearch.repair-manufacturer.html', {
      svcInfo, pageInfo
    });
  }
}

export default CustomerAgentsearchRepairManufacturer;
