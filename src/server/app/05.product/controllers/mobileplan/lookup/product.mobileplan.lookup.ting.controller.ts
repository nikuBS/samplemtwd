/**
 * 모바일 요금제 > 데이터 상한금액 조회
 * FileName: product.mobileplan.lookup.ting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanLookupTing extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00002670', 'NA00002671', 'NA00002669'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: '혜택 이용내역'
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    res.render('mobileplan/lookup/product.mobileplan.lookup.ting.html', renderCommonInfo);
  }
}

export default ProductMobileplanLookupTing;
