/**
 * FileName: customer.praise.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.22
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class CustomerPraise extends TwViewController {
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _layerType: string) {
    res.render('praise/customer.praise.html', { svcInfo });
  }
}
