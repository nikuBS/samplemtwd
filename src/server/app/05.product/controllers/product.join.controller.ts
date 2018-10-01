/**
 * FileName: product.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class ProductDetail extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    res.render('product.join.html');
  }
}

export default ProductDetail;
