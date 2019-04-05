/**
 * MenuName: T로밍 > 로밍안내 > 자동안심 T로밍이란? (RM_16_03)
 * FileName: product.roaming.info.secure-troaming.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingSecureTroaming extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.secure-troaming.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingSecureTroaming;

