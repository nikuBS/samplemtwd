/**
 * FileName: product.roaming.search-result.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingSearchResult extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render('roaming/product.roaming.search-result.html', { svcInfo });
  }
}

export default ProductRoamingSearchResult;

