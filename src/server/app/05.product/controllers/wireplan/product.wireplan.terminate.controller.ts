/**
 * 상품 해지 - 유선 부가서비스
 * @file product.wireplan.terminate.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

class ProductWireplanTerminate extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param currentAdditionsInfo
   * @private
   */
  private _getBtnData(currentAdditionsInfo: any): any {
    if (FormatHelper.isEmpty(currentAdditionsInfo.btnData)) {
      return null;
    }

    return currentAdditionsInfo.btnData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0168, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '03' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0168, { joinTermCd: '03' }, {}, [prodId])
    ).subscribe(([preCheckInfo, joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('wireplan/product.wireplan.terminate.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, false),
        btnData: this._getBtnData(currentAdditionsInfo.result)
      }));
    });
  }
}

export default ProductWireplanTerminate;
