/**
 * 유선 부가서비스 > 가입 공통 (옵션입력 없음)
 * FileName: product.wireplan.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';
import BFF_10_0111_mock from '../../../../../mock/server/product.BFF_10_0111.mock';

class ProductWireplanJoin extends TwViewController {
  constructor() {
    super();
  }

  // @todo mock
  private _getApi(prodId: any): Observable<any> {
    return Observable.of(BFF_10_0111_mock);
    // return this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '03' }, {}, prodId);
  }

  private _getAddSvcAddYn(currentAdditionsInfo: any): any {
    if (FormatHelper.isEmpty(currentAdditionsInfo.pays) || FormatHelper.isEmpty(currentAdditionsInfo.pays)) {
      return 'N';
    }
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest(
      this._getApi(prodId),
      this.apiService.request(API_CMD.BFF_05_0129, {})
    ).subscribe(([joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('wireplan/join/product.wireplan.join.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, true),
        addSvcAddYn: this._getAddSvcAddYn(currentAdditionsInfo.result)
      }));
    });
  }
}

export default ProductWireplanJoin;
