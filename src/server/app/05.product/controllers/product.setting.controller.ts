/**
 * FileName: product.setting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class ProductDetail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render('product.detail.html');
  }
}

export default ProductDetail;
