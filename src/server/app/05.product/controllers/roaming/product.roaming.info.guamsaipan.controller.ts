/**
 * MenuName: T로밍 > 로밍안내 > T괌사이판 국내처럼 (RM_19)
 * @file product.roaming.info.guamsaipan.controller.ts
 * @author p026951
 * @since 2019.05.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingGuamSaipan extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.guamsaipan.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingGuamSaipan;

