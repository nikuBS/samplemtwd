/**
 * 모바일 요금제 > 가입 공통 (옵션 입력 없음)
 * FileName: product.mobileplan.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import { REDIS_PRODUCT_COMPARISON } from '../../../../../types/redis.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanJoin extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 요금제 비교하기 Redis 정보 호출
   * @param svcInfoProdId
   * @param prodId
   * @private
   */
  private _getMobilePlanCompareInfo(svcInfoProdId: any, prodId: any): Observable<any> {
    if (FormatHelper.isEmpty(svcInfoProdId)) {
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      svcInfoProdId = svcInfo ? svcInfo.prodId : null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0008, {}, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0009, {}),
      this._getMobilePlanCompareInfo(svcInfoProdId, prodId)
    ).subscribe(([joinTermInfo, overPayReqInfo, mobilePlanCompareInfo]) => {
      if (joinTermInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: joinTermInfo.code,
          msg: joinTermInfo.msg
        }));
      }

      res.render('mobileplan/join/product.mobileplan.join.html', Object.assign(renderCommonInfo, {
        joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
        mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        prodId: prodId
      }));
    });
  }
}

export default ProductMobileplanJoin;
