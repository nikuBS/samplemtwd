/**
 * MenuName: T로밍 > 로밍안내 > SMS, 데이터 로밍 (RM_16_04)
 * @file product.roaming.info.data-roaming.controller.ts
 * @author Eunjung Jung
 * @since 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingDataRoaming extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.data-roaming.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingDataRoaming;

