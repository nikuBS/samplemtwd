/**
 * @file product.wireplan.service-area.controller.ts
 * @author Jiyoung Jo (jiyoungjo@sk.com)
 * @since 2019.04.04
 */


import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductWireServiceArea extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('wireplan/product.wireplan.service-area.html', { svcInfo, pageInfo });
  }
}
