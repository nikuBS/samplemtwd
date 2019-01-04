/**
 * FileName: customer.researches.result.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class CustomerResearchesResult extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('researches/customer.researches.result.html', { svcInfo, pageInfo });
  }
}
