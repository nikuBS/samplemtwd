/**
 * FileName: product.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { PRODUCT_SETTING } from '../../../mock/server/product.display-ids.mock';
import { API_CMD } from '../../../types/api-command.type';

class ProductTerminate extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render('product.terminate.html', {
      svcInfo: svcInfo
    });
  }
}

export default ProductTerminate;
