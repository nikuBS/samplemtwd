/**
 * 인터넷/전화/TV > 구비서류 제출
 * FileName: product.wireplan.join.require-document.history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductWireplanJoinRequireDocumentHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('wireplan/join/product.wireplan.join.require-document.history.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    });
  }
}

export default ProductWireplanJoinRequireDocumentHistory;
