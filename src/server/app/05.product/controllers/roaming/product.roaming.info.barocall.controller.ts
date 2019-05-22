/**
 * MenuName: T로밍 > 로밍안내 > baro 통화 (RM_18)
 * @file product.roaming.info.barocall.controller.ts
 * @author p026951
 * @since 2019.05.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingBaroCall extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.barocall.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingBaroCall;

