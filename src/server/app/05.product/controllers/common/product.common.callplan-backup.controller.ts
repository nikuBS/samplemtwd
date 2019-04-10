/**
 * 상품 원장 URL PathVariable Backup. 방어용
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 */
class ProductCommonCallplanBackup extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.redirect('/product/callplan?prod_id=' + req.params.prodId);
  }
}

export default ProductCommonCallplanBackup;
