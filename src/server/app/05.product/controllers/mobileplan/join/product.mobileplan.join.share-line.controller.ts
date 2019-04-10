/**
 * 모바일 요금제 > Ttab 공유회선
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
class ProductMobileplanJoinShareLine extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00005057', 'NA00005058', 'NA00005059', 'NA00005060',
    'NA00003958', 'NA00003557', 'NA00003558', 'NA00003556', 'NA00005057'];

  /* 상품별 툴팁코드 분기처리 */
  private readonly _toolTip = {
    NA00005057: 'MP_02_02_03_11_tip_02',
    NA00005058: 'MP_02_02_03_11_tip_03',
    NA00005059: 'MP_02_02_03_11_tip_04',
    NA00005060: 'MP_02_02_03_11_tip_05'
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

      res.render('mobileplan/join/product.mobileplan.join.share-line.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        isApp: BrowserHelper.isApp(req),
        toolTip: FormatHelper.isEmpty(this._toolTip[prodId]) ? null : this._toolTip[prodId],
        mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
        joinTermInfo: Object.assign(ProductHelper.convPlansJoinTermInfo(joinTermInfo.result), {
          sktProdBenfCtt: FormatHelper.isEmpty(prodRedisInfo.result.summary.sktProdBenfCtt) ? '' : prodRedisInfo.result.summary.sktProdBenfCtt
        })
      }));
    });
  }
}

export default ProductMobileplanJoinShareLine;
