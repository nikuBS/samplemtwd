/*
 * FileName: product.t-plus.input.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductTPlusInput extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
    const data = {
      svcInfo: svcInfo
    };
    res.render('product.t-plus.input.html', { data });
  }
}

export default ProductTPlusInput;