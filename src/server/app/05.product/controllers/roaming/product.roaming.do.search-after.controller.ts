/**
 * FileName: product.roaming.do.search-after.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingSearchAfter extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render('roaming/product.roaming.do.search-after.html', { svcInfo });
  }
}

export default ProductRoamingSearchAfter;

