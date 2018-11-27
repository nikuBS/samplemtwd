/**
 * 상품 해지 - 유선 부가서비스
 * FileName: product.wireplan.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import BFF_10_0115_mock from '../../../../mock/server/product.BFF_10_0115.mock';

class ProductWireplanTerminate extends TwViewController {
  constructor() {
    super();
  }

  private _getApi(prodId: any): Observable<any> {
    return Observable.of(BFF_10_0115_mock);
    // return this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '03' }, {}, prodId);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    this._getApi(prodId)
      .subscribe((joinTermInfo) => {
        // console.log(joinTermInfo);
        if (joinTermInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg
          }));
        }

        res.render('mobileplan-add/product.wireplan.terminate.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
        }));
      });
  }
}

export default ProductWireplanTerminate;
