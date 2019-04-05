/**
 * MenuName: T로밍 > 로밍안내 > 자동로밍 (RM_16_02_01)
 * @file product.roaming.info.lte.controller.ts
 * @author Eunjung Jung
 * @since 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingLteGuide extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.lte.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingLteGuide;

