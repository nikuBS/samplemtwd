/**
 * 모바일 요금제 > 0플랜 스몰, 미디엄
 * @file product.mobileplan.join.0plan-sm.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.01.10
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import ProductHelper from '../../../../../utils/product.helper';
import { REDIS_KEY } from '../../../../../types/redis.type';

class ProductMobileplanJoin0planSm extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00006155', 'NA00006156'];

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

    return this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      svcInfoProdId = svcInfo ? svcInfo.prodId : null,
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
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0169, {}),
      this.apiService.request(API_CMD.BFF_10_0009, {}),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this._getMobilePlanCompareInfo(svcInfoProdId, prodId)
    ).subscribe(([ preCheckInfo, basicInfo, settingInfo, overPayReqInfo, prodRedisInfo, mobilePlanCompareInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo, settingInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan/join/product.mobileplan.join.0plan-sm.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        settingInfo: settingInfo.result,
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
        sktProdBenfCtt: FormatHelper.isEmpty(prodRedisInfo.result.summary.sktProdBenfCtt) ? '' :
          prodRedisInfo.result.summary.sktProdBenfCtt // SKT만의 혜택
      }));
    });
  }
}

export default ProductMobileplanJoin0planSm;
