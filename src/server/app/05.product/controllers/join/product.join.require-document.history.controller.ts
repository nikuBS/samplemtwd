/**
 * FileName: product.join.require-document.history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductJoinRequireDocumentHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('join/product.join.require-document.history.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    });
  }
}

export default ProductJoinRequireDocumentHistory;
