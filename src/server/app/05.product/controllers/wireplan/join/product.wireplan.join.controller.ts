/**
 * 유선 부가서비스 > 가입 공통 (옵션입력 없음)
 * FileName: product.wireplan.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';

class ProductWireplanJoin extends TwViewController {
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
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0164, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '01' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0164, { joinTermCd: '01' }, {}, [prodId])
    ).subscribe(([preCheckInfo, joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true,
          pageInfo: pageInfo
        }));
      }

      res.render('wireplan/join/product.wireplan.join.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, true),
        btnData: this._getBtnData(currentAdditionsInfo.result)
      }));
    });
  }
}

export default ProductWireplanJoin;
