/**
 * FileName: product.roaming.info.secure-troaming.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingSecureTroaming extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render( 'roaming/product.roaming.info.secure-troaming.html', { svcInfo });
  }
}

export default ProductRoamingSecureTroaming;

