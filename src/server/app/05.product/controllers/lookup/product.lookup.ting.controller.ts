/**
 * FileName: product.lookup.ting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class ProductLookupTing extends TwViewController {
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

    this.apiService.request(API_CMD.BFF_10_0040, {}, {}, prodId)
      .subscribe((tingInfo) => {
        if (tingInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: tingInfo.code,
            msg: tingInfo.msg
          }));
        }

        res.render('lookup/product.lookup.ting.html', Object.assign(renderCommonInfo, {
          tingInfo: tingInfo.result
        }));
      });
  }
}

export default ProductLookupTing;
