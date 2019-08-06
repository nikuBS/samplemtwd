/**
 * 유선 부가서비스 > ocb
 * FileName: product.wire.add.ocb
 * @author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since: 2019. 8. 2.
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
/**
 * @class
 */
class ProductWireplanOkCashback extends TwViewController {
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
      res.render('wireplan/join/product.wireplan.join.ocb.html', {
        svcInfo,
        pageInfo,
        eid: req.query.eid
      });
  }
}

export default ProductWireplanOkCashback;
