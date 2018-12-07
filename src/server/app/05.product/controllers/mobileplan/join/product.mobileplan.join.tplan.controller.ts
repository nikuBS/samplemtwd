/**
 * 모바일 요금제 > Data 인피니티
 * FileName: product.mobileplan.join.tplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import { REDIS_PRODUCT_COMPARISON } from '../../../../../types/redis.type';
import FormatHelper from '../../../../../utils/format.helper';
import ProductHelper from '../../../../../utils/product.helper';

class ProductMobileplanJoinTplan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005959'];

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

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0008, {}, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0009, {}),
      this._getMobilePlanCompareInfo(svcInfoProdId, prodId)
    ).subscribe(([ basicInfo, joinTermInfo, overPayReqInfo, mobilePlanCompareInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('mobileplan/join/product.mobileplan.join.tplan.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
        joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N'
      }));
    });
  }
}

export default ProductMobileplanJoinTplan;
