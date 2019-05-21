/**
 * MenuName: T로밍 > 로밍안내 > baro 무료 체험 프로모션 (RM_20)
 * @file product.roaming.info.baropromotion.controller.ts
 * @author p026951
 * @since 2019.05.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingBaroPromotion extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.baropromotion.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingBaroPromotion;

