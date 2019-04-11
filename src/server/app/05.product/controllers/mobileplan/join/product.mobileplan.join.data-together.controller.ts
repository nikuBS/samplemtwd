/**
 * 모바일 요금제 > 데이터 함께쓰기
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';
import { REDIS_KEY } from '../../../../../types/redis.type';

/**
 * @class
 */
class ProductMobileplanJoinDataTogether extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00003556', 'NA00003557', 'NA00003558', 'NA00003958', 'NA00006547', 'NA00006548'];

  /* 상품별 툴팁 분기처리 */
  private readonly _tipIds = {
    NA00003556: 'MP_02_02_03_05_tip_01',
    NA00003557: 'MP_02_02_03_05_tip_01',
    NA00003558: 'MP_02_02_03_05_tip_01',
    NA00003958: 'MP_02_02_03_05_tip_02',
    NA00006547: 'TC000044',
    NA00006548: 'TC000044'
  };

  /**
   * 요금제 비교하기 Redis 정보 호출
   * @param svcInfoProdId - 사용자 세션 상품코드 (현재 요금제)
   * @param prodId - 페이지 진입한 상품코드 (변경할 요금제)
   */
  private _getMobilePlanCompareInfo(svcInfoProdId: any, prodId: any): Observable<any> {
    if (FormatHelper.isEmpty(svcInfoProdId)) {
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
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
      this.apiService.request(API_CMD.BFF_10_0008, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0009, {}),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this._getMobilePlanCompareInfo(svcInfoProdId, prodId)
    ).subscribe(([ preCheckInfo, basicInfo, joinTermInfo, overPayReqInfo, prodRedisInfo, mobilePlanCompareInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan/join/product.mobileplan.join.data-together.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        isApp: BrowserHelper.isApp(req),
        tipId: this._tipIds[prodId],
        mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
        joinTermInfo: Object.assign(ProductHelper.convPlansJoinTermInfo(joinTermInfo.result), {
          sktProdBenfCtt: FormatHelper.isEmpty(prodRedisInfo.result.summary.sktProdBenfCtt) ? '' : prodRedisInfo.result.summary.sktProdBenfCtt
        }),
        is5g: ['NA00006547', 'NA00006548'].indexOf(prodId) >= 0
      }));
    });
  }
}

export default ProductMobileplanJoinDataTogether;
