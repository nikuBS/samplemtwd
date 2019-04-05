/**
 * 모바일 부가서비스 > T가족모아데이터
 * @file product.mobileplan-add.join.t-family.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.02.12
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';

class ProductMobileplanAddJoinTFamily extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00006031'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0171, {}, {}, []),
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
    ).subscribe(([ preCheckInfo, preInfo, joinTermInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, preInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan-add/join/product.mobileplan-add.join.t-family.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        preInfo: Object.assign(preInfo.result, {
          groupRepYn: FormatHelper.isEmpty(preInfo.result.groupRepYn) ? 'N' : preInfo.result.groupRepYn
        }),
        joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
      }));
    });
  }
}

export default ProductMobileplanAddJoinTFamily;
