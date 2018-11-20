/**
 * FileName: product.roaming.info.data-roaming.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingDataRoaming extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render( 'roaming/product.roaming.info.data-roaming.html', { svcInfo });
  }
}

export default ProductRoamingDataRoaming;

