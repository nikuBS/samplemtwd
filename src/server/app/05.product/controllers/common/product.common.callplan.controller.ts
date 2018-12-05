/**
 * FileName: product.common.callplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 * @see prodTypCd (AB: 모바일 요금제, C: 모바일 부가서비스, D: 인터넷/TV/전화, E: 인터넷/TV/전화 부가서비스, F: 결합상품, G: 할인프로그램, H: 로밍)
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { REDIS_PRODUCT_INFO, REDIS_PRODUCT_COMPARISON } from '../../../../types/redis.type';
import {
  DATA_UNIT,
  PRODUCT_CALLPLAN_FEEPLAN,
  PRODUCT_SIMILAR_PRODUCT,
  PRODUCT_TYPE_NM
} from '../../../../types/string.type';
import {PRODUCT_CALLPLAN, PRODUCT_CALLPLAN_BENEFIT_REDIRECT, PRODUCT_TYP_CD_LIST} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import DateHelper from '../../../../utils/date.helper';
import { REDIS_PRODUCT_FILTER } from '../../../../types/redis.type';

class ProductCommonCallplan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _benefitRedirectProdList = ['TW20000014', 'TW20000018', 'TW20000019'];

  /**
   * 요금제 비교하기 Redis 정보 호출
   * @param prodTypCd
   * @param svcInfoProdId
   * @param prodId
   * @private
   */
  private _getMobilePlanCompareInfo(prodTypCd: any, svcInfoProdId: any, prodId: any): Observable<any> {
    if (prodTypCd !== 'AB' || FormatHelper.isEmpty(svcInfoProdId)) {
      return Observable.of({});
    }

    return this.redisService.getData(REDIS_PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  /**
   * 가입여부 확인
   * @param prodTypCd
   * @param prodId
   * @private
   */
  private _getIsJoined(prodTypCd: any, prodId: any): Observable<any> {
    if (['C', 'E', 'F', 'G', 'H'].indexOf(prodTypCd) === -1) {
      return Observable.of({});
    }

    if (['C', 'G', 'H'].indexOf(prodTypCd) !== -1) {
      return this.apiService.request(API_CMD.BFF_05_0040, {}, {}, prodId);
    }

    if (prodTypCd === 'E') {
      return this.apiService.request(API_CMD.BFF_10_0109, {}, {}, prodId);
    }

    return this.apiService.request(API_CMD.BFF_10_0119, {}, {}, prodId);
  }

  /**
   * 모바일 부가서비스 카테고리 필터 리스트 Redis 호출
   * @param prodTypCd
   * @param prodId
   * @private
   */
  private _getAdditionsFilterListByRedis(prodTypCd: any, prodId: any): Observable<any> {
    if (prodTypCd !== 'C') {
      return Observable.of({});
    }

    return this.redisService.getData(REDIS_PRODUCT_FILTER + 'F01230');
  }

  /**
   * 인터넷/TV/전화, 결합상품 구비서류 심사내역 조회
   * @param prodTypCd
   * @param prodId
   * @private
   */
  private _getCombineRequireDocumentStatus(prodTypCd: any, prodId: any): Observable<any> {
    if (['D', 'F'].indexOf(prodTypCd) === -1) {
      return Observable.of({});
    }

    const reqParams: any = {};
    if (FormatHelper.isEmpty(prodId)) {
      reqParams.svcProdCd = prodId === 'NH00000083' ? 'NH00000084' : prodId;
    }

    return this.apiService.request(API_CMD.BFF_10_0078, reqParams);
  }

  /**
   * @param basicInfo
   * @private
   */
  private _convertBasicInfo (basicInfo): any {
    const joinBtnList: any = [],
      settingBtnList: any = [],
      termBtnList: any = [];

    let isJoinReservation: any = false;

    basicInfo.linkBtnList.forEach((item) => {
      if (item.linkTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE') {
        settingBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'CT') {
        isJoinReservation = true;
        return true;
      }

      termBtnList.push(item);
    });

    return Object.assign(basicInfo, {
      prodTypListPath: PRODUCT_TYP_CD_LIST[basicInfo.prodTypCd],
      linkBtnList: {
        join: joinBtnList,
        setting: settingBtnList,
        terminate: termBtnList
      },
      isJoinReservation: isJoinReservation
    });
  }

  /**
   * @param prodRedisInfo
   * @private
   */
  private _convertRedisInfo (prodRedisInfo): any {
    if (FormatHelper.isEmpty(prodRedisInfo)) {
      return {};
    }

    const basDataGbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrGbDataQtyCtt),
      basDataMbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrMbDataQtyCtt),
      basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

    return Object.assign(prodRedisInfo, {
      summary: Object.assign(prodRedisInfo.summary, ProductHelper.convProductSpecifications(prodRedisInfo.summary.basFeeInfo,
        basDataTxt.txt, prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt, basDataTxt.unit)),
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
      contents: this._convertContents(prodRedisInfo.contents),
      banner: this._convertBanners(prodRedisInfo.banner)
    });
  }

  /**
   * @param basDataGbTxt
   * @param basDataMbTxt
   * @private
   */
  private _getBasDataTxt(basDataGbTxt: any, basDataMbTxt: any): any {
    if (!FormatHelper.isEmpty(basDataGbTxt)) {
      return {
        txt: basDataGbTxt,
        unit: DATA_UNIT.GB
      };
    }

    if (!FormatHelper.isEmpty(basDataMbTxt)) {
      return {
        txt: basDataMbTxt,
        unit: DATA_UNIT.MB
      };
    }

    return {
      txt: null,
      unit: null
    };
  }

  /**
   * @param summaryInfo
   * @private
   */
  private _getSummaryCase(summaryInfo): any {
    if (!FormatHelper.isEmpty(summaryInfo.ledItmDesc)) {
      return '3';
    }

    if (!FormatHelper.isEmpty(summaryInfo.sktProdBenfCtt)) {
      return '2';
    }

    return '1';
  }

  /**
   * @param contentsInfo
   * @private
   */
  private _convertContents (contentsInfo): any {
    const contentsResult: any = {
      LIST: [],
      LA: null,
      R: null,
      PLM_FIRST: null
    };

    contentsInfo.forEach((item) => {
      if (item.vslLedStylCd === 'R' || item.vslLedStylCd === 'LA') {
        contentsResult[item.vslLedStylCd] = item.ledItmDesc;
        return true;
      }

      if (FormatHelper.isEmpty(item.titleNm)) {
        return true;
      }

      if (FormatHelper.isEmpty(contentsResult.PLM_FIRST)) {
        contentsResult.PLM_FIRST = item.ledItmDesc;
        return true;
      }

      contentsResult.LIST.push(Object.assign(item, {
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prCont' : 'plm')
      }));
    });

    return contentsResult;
  }

  /**
   * @param bannerInfo
   * @private
   */
  private _convertBanners (bannerInfo): any {
    const bannerResult: any = {};
    if (FormatHelper.isEmpty(bannerInfo)) {
      return bannerResult;
    }

    bannerInfo.forEach((item) => {
      bannerResult[item.bnnrLocCd] = item;
    });

    return bannerResult;
  }

  /**
   * @param relateTags
   * @private
   */
  private _convertRelateTags (relateTags: any): any {
    if (FormatHelper.isEmpty(relateTags.prodTagList)) {
      return [];
    }

    return relateTags.prodTagList;
  }

  /**
   * @param prodTypCd
   * @param isJoinedInfo
   * @private
   */
  private _isJoined (prodTypCd, isJoinedInfo): boolean {
    if (FormatHelper.isEmpty(isJoinedInfo) || isJoinedInfo.code !== API_CODE.CODE_00) {
      return false;
    }

    if (['C', 'G', 'H'].indexOf(prodTypCd) !== -1) {
      return isJoinedInfo.result.isAdditionUse === 'Y';
    }

    if (prodTypCd === 'E') {
      return isJoinedInfo.result.wiredSuplSvcScrbYn === 'Y';
    }

    return isJoinedInfo.result.combiProdScrbYn === 'Y';
  }

  /**
   * @param prodTypCd
   * @param apiInfo
   * @param isSeries
   * @private
   */
  private _convertSeriesAndRecommendInfo (prodTypCd, apiInfo, isSeries): any {
    if (FormatHelper.isEmpty(apiInfo)) {
      return null;
    }

    const list = isSeries ? apiInfo.seriesProdList : apiInfo.recommendProdList;
    return list.map((item) => {
      const convResult = ProductHelper.convProductSpecifications(item.basFeeInfo, item.basOfrDataQtyCtt,
        item.basOfrVcallTmsCtt, item.basOfrCharCntCtt),
        isSeeContents = convResult.basFeeInfo.value === PRODUCT_CALLPLAN.SEE_CONTENTS;

      return [item, convResult, this._getDisplayFlickSlideCondition(prodTypCd, isSeeContents, convResult)]
        .reduce((a, b) => {
          return Object.assign(a, b);
        });
    });
  }

  /**
   * @param prodTypCd
   * @param isSeeContents
   * @param convResult
   * @private
   */
  private _getDisplayFlickSlideCondition(prodTypCd, isSeeContents, convResult): any {
    if (prodTypCd !== 'AB') {
      return { isDisplayData: false, isDisplayVcall: false, isDisplayChar: false };
    }

    return {
      isDisplayData: !isSeeContents,
      isDisplayVcall: !isSeeContents && FormatHelper.isEmpty(convResult.basOfrDataQtyCtt),
      isDisplayChar: !isSeeContents && FormatHelper.isEmpty(convResult.basOfrDataQtyCtt) && FormatHelper.isEmpty(convResult.basOfrVcallTmsCtt)
    };
  }

  /**
   * @param prodTypCd
   * @param similarProductInfo
   * @private
   */
  private _convertSimilarProduct (prodTypCd: any, similarProductInfo: any) {
    if (similarProductInfo.code !== API_CODE.CODE_00) {
      return null;
    }

    let titleNm: any = PRODUCT_SIMILAR_PRODUCT.PRODUCT;
    if (prodTypCd === 'AB') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.PLANS;
    }

    if (prodTypCd === 'C') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.ADDITIONS;
    }

    return Object.assign(similarProductInfo.result, {
      titleNm: titleNm,
      prodFltIds: FormatHelper.isEmpty(similarProductInfo.result.list) ? '' : similarProductInfo.result.list.map((item) => {
        return item.prodFltId;
      }).join(',')
    });
  }

  /**
   * @param requireDocumentInfo
   * @private
   */
  private _convertRequireDocument (requireDocumentInfo: any) {
    if (requireDocumentInfo.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(requireDocumentInfo.result.necessaryDocumentInspectInfoList)) {
      return null;
    }

    const latestItem = requireDocumentInfo.result.necessaryDocumentInspectInfoList[0],
      nextSchdDtTime = FormatHelper.isEmpty(latestItem.nextSchddt) ? null :
        DateHelper.getUnixTimeStamp(new Date(DateHelper.getAddDay(latestItem.nextSchddt))),
      currentTime = new Date().getTime() / 1000;

    return Object.assign(latestItem, {
      isNeedDocument: nextSchdDtTime && (latestItem.ciaInsptRslt === PRODUCT_CALLPLAN.CIA_INSPT_RSLT && currentTime < nextSchdDtTime),
      isExpired: nextSchdDtTime && (latestItem.abnSaleOpClCd === '000' && currentTime > nextSchdDtTime),
      isProcess: nextSchdDtTime && (FormatHelper.isEmpty(latestItem.abnSaleOpClCd) && currentTime < nextSchdDtTime)
    });
  }

  /**
   * @param prodTypCd
   * @private
   */
  private _getIsCategory (prodTypCd: any): any {
    return {
      isMobileplan: prodTypCd === 'AB',
      isMobileplanAdd: prodTypCd === 'C',
      isWireplan: ['D_I', 'D_P', 'D_T'].indexOf(prodTypCd) !== -1,
      isWireplanAdd: ['E_I', 'E_P', 'E_T'].indexOf(prodTypCd) !== -1,
      isRoaming: ['H_P', 'H_A'].indexOf(prodTypCd) !== -1,
      isCombine: prodTypCd === 'F',
      isDiscount: prodTypCd === 'G'
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      svcInfoProdId = svcInfo ? svcInfo.prodId : null,
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.CALLPLAN
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    if (this._benefitRedirectProdList.indexOf(prodId) !== -1) {
      return res.render('common/callplan/product.common.callplan.redirect.html', {
        redirectUrl: PRODUCT_CALLPLAN_BENEFIT_REDIRECT[prodId]
      });
    }

    this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId)
      .subscribe((basicInfo) => {
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: basicInfo.code,
            msg: basicInfo.msg
          }));
        }

        // 상품 퇴출 상태 (G1000)
        if (basicInfo.result.prodStCd === 'G1000') {
          return this.error.render(res, renderCommonInfo);
        }

        Observable.combineLatest(
          this.apiService.request(API_CMD.BFF_10_0003, {}, {}, prodId),
          this.apiService.request(API_CMD.BFF_10_0005, {}, {}, prodId),
          this.apiService.request(API_CMD.BFF_10_0006, {}, {}, prodId),
          this.apiService.request(API_CMD.BFF_10_0139, {}, {}, prodId),
          this.apiService.request(API_CMD.BFF_10_0112, {}, {}, prodId),
          this.redisService.getData(REDIS_PRODUCT_INFO + prodId),
          this._getMobilePlanCompareInfo(basicInfo.result.prodTypCd, svcInfoProdId, prodId),
          this._getIsJoined(basicInfo.result.prodTypCd, prodId),
          this._getAdditionsFilterListByRedis(basicInfo.result.prodTypCd, prodId),
          this._getCombineRequireDocumentStatus(basicInfo.result.prodTypCd, prodId)
        ).subscribe(([
          relateTagsInfo, seriesInfo, recommendsInfo, recommendsAppInfo, similarProductInfo, prodRedisInfo,
          mobilePlanCompareInfo, isJoinedInfo, additionsProdFilterInfo, combineRequireDocumentInfo
        ]) => {
          const apiError = this.error.apiError([ relateTagsInfo, seriesInfo, recommendsInfo ]);

          if (!FormatHelper.isEmpty(apiError)) {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              msg: apiError.msg,
              code: apiError.code
            }));
          }

          if (FormatHelper.isEmpty(prodRedisInfo)) {
            return this.error.render(res, renderCommonInfo);
          }

          const isCategory = this._getIsCategory(basicInfo.result.prodTypCd),
            basFeeSubText: any = isCategory.isWireplan && !FormatHelper.isEmpty(prodRedisInfo.summary.feeManlSetTitNm) ?
              prodRedisInfo.summary.feeManlSetTitNm : PRODUCT_CALLPLAN_FEEPLAN;

          res.render('common/callplan/product.common.callplan.html', [renderCommonInfo, isCategory, {
            prodId: prodId,
            basFeeSubText: basFeeSubText,
            basicInfo: this._convertBasicInfo(basicInfo.result),  // 상품 정보 by Api
            prodRedisInfo: this._convertRedisInfo(prodRedisInfo), // 상품 정보 by Redis
            relateTags: this._convertRelateTags(relateTagsInfo.result), // 연관 태그
            series: this._convertSeriesAndRecommendInfo(basicInfo.result.prodTypCd, seriesInfo.result, true), // 시리즈 상품
            recommends: this._convertSeriesAndRecommendInfo(basicInfo.result.prodTypCd, recommendsInfo.result, false),  // 함께하면 유용한 상품
            recommendApps: recommendsAppInfo.result,
            mobilePlanCompareInfo: FormatHelper.isEmpty(mobilePlanCompareInfo) ? null : mobilePlanCompareInfo, // 요금제 비교하기
            similarProductInfo: this._convertSimilarProduct(basicInfo.result.prodTypCd, similarProductInfo),  // 모바일 요금제 유사한 상품
            isJoined: this._isJoined(basicInfo.result.prodTypCd, isJoinedInfo),  // 가입 여부
            additionsProdFilterInfo: additionsProdFilterInfo,  // 부가서비스 카테고리 필터 리스트
            combineRequireDocumentInfo: this._convertRequireDocument(combineRequireDocumentInfo)  // 구비서류 제출 심사내역
          }].reduce((a, b) => {
            return Object.assign(a, b);
          }));
        });
      });
  }
}

export default ProductCommonCallplan;
