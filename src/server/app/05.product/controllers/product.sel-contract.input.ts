/*
 * FileName: product.sel-contract.input.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductSelContractInput extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
    const data: any = {
      svcInfo: svcInfo,
    };
    if ( req.query.type ) {
      data.type = req.query.type;
    }
    res.render('product.sel-contract.input.html', { data });
  }
}

export default ProductSelContractInput;
