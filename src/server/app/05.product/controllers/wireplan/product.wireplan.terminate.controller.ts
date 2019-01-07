/**
 * 상품 해지 - 유선 부가서비스
 * FileName: product.wireplan.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
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
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '03' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0101, { joinTermCd: '03' }, {}, [prodId])
    ).subscribe(([joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
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
