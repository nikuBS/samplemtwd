/*
 * FileName: product.dis-pgm.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductDisPgmJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data = {
      svcInfo: svcInfo
    };
    res.render('product.dis-pgm.join.html', { data });
  }
}

export default ProductDisPgmJoin;