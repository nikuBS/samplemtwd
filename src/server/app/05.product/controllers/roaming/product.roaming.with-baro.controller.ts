/**
 * @MenuName: T로밍 > baro와 함께 안전하게
 * @file product.roaming.with-baro.controller.ts
 * @author ByungSo Oh
 * @since 2020.03.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
// import { Observable } from 'rxjs/Observable';

class ProductRoamingWithBaro extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render( 'roaming/product.roaming.with-baro.html', { svcInfo, pageInfo });
  }
}

export default ProductRoamingWithBaro;
