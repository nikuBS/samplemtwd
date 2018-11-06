/**
 * FileName: product.wire.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductWire extends TwViewController {
  private WIRE_CODE = 'F01300';

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('wire/product.wire.html', { svcInfo, pageInfo });
  }
}
