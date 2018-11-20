/**
 * FileName: product.roaming.info.lte.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingLteGuide extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render( 'roaming/product.roaming.info.lte.html', { svcInfo });
  }
}

export default ProductRoamingLteGuide;

