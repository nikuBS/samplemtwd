/**
 * 모바일 요금제 - 내게 맞는 요금제 찾기
 * @file product.mobileplan.find.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class ProductMobileplanFind extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('mobileplan/product.mobileplan.find.html', {
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default ProductMobileplanFind;
