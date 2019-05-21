/**
 * MenuName: T로밍 > 로로밍 상품 이용 안내 (RM_17)
 * @file product.roaming.fee-info.controller
 * @author Hyeryoun Lee
 * @since 2019. 5. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductRoamingFeeInfo extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('roaming/product.roaming.fee-info.html', { svcInfo , pageInfo});
  }
}
