/**
 * MenuName: T로밍 > 로밍 안내 > submain (RM_16_01)
 * FileName: product.roaming.info.guide.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductRoamingGuide extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.info.guide.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingGuide;

