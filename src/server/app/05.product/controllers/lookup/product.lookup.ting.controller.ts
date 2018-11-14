/**
 * FileName: product.lookup.ting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class ProductLookupTing extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00003160', 'NA00003161', 'NA00002591', 'NA00002592', 'NA00002593', 'NA00002594', 'NA00003011',
    'NA00003048', 'NA00003146', 'NA00003405', 'NA00003406', 'NA00003407', 'NA00003408'];

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

    res.render('lookup/product.lookup.ting.html', renderCommonInfo);
  }
}

export default ProductLookupTing;
