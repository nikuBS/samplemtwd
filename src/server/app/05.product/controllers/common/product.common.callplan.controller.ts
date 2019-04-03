/**
 * FileName: product.common.callplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {
  DATA_UNIT,
  PRODUCT_CALLPLAN_FEEPLAN, PRODUCT_REQUIRE_DOCUMENT, PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT,
  PRODUCT_SIMILAR_PRODUCT,
  PRODUCT_TYPE_NM
} from '../../../../types/string.type';
import { BENEFIT_SUBMAIN_CATEGORY, PRODUCT_CALLPLAN,
  PRODUCT_CALLPLAN_BENEFIT_REDIRECT, PRODUCT_TYP_CD_LIST} from '../../../../types/bff.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import EnvHelper from '../../../../utils/env.helper';

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
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  /**
   * 가입여부 확인
   * @param svcInfo
   * @param prodTypCd
   * @param prodId
   * @param plmProdList
   * @private
   */
  private _getIsJoined(svcInfo: any, prodTypCd: any, prodId: any, plmProdList?: any): Observable<any> {
    if (FormatHelper.isEmpty(svcInfo)) {
      return Observable.of({});
    }

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(prodTypCd) !== -1) {
      return Observable.of({ code: '00' });
    }

    const reqParams = FormatHelper.isEmpty(plmProdList) ? {} : { mappProdIds: (plmProdList.map((item) => {
        return item.plmProdId;
      })).join(',') };

    if (['C', 'H_P', 'H_A'].indexOf(prodTypCd) !== -1) {
      return this.apiService.request(API_CMD.BFF_05_0040, reqParams, {}, [prodId]);
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(prodTypCd) !== -1) {
      return this.apiService.request(API_CMD.BFF_10_0109, reqParams, {}, [prodId]);
    }

    return this.apiService.request(API_CMD.BFF_10_0119, {}, {}, [prodId]);
  }

  /**
   * 모바일 부가서비스 카테고리 필터 리스트 Redis 호출
   * @param prodTypCd
   * @param prodId
   * @private
   */
  private _getAdditionsFilterListByRedis(prodTypCd: any, prodId: any): Observable<any> {
    if (prodTypCd !== 'C') {
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_FILTER + 'F01230');
  }

  /**
   * 인터넷/TV/전화, 결합상품 구비서류 심사내역 조회
   * @param prodTypCd
   * @param prodId
   * @private
   */
  private _getCombineRequireDocumentStatus(prodTypCd: any, prodId: any): Observable<any> {
    if (['D_I', 'D_P', 'D_T', 'F'].indexOf(prodTypCd) === -1) {
      return Observable.of({});
    }

    const reqParams: any = {};
    if (FormatHelper.isEmpty(prodId)) {
      reqParams.svcProdCd = prodId === 'NH00000083' ? 'NH00000084' : prodId;
    }

    return this.apiService.request(API_CMD.BFF_10_0078, reqParams);
  }

  /**
   * @param grpProdScrnConsCd
   * @param prodId
   * @private
   */
  private _getMyContentsData(grpProdScrnConsCd: any, prodId: any): any {
    if (grpProdScrnConsCd === 'SRRL') {
      return Observable.of({});
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_CONTETNS + prodId);
  }

  /**
   * @param prodGrpYn
   * @param repProdId
   * @param prodGrpRepYn
   * @private
   */
  private _getExtendContentsData(prodGrpYn: any, repProdId: any, prodGrpRepYn: any): any {
    if (prodGrpYn !== 'Y' || prodGrpRepYn === 'Y') {
      return Observable.of({});
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_CONTETNS + repProdId);
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
      if (item.linkTypCd === 'SE' && basicInfo.prodSetYn !== 'Y') {
        return true;
      }

      if (item.linkTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE' && basicInfo.prodSetYn === 'Y') {
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
   * @param prodStCd
   * @param prodRedisInfo
   * @private
   */
  private _convertRedisInfo (prodStCd, prodRedisInfo): any {
    if (FormatHelper.isEmpty(prodRedisInfo)) {
      return {};
    }

    const basDataGbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrGbDataQtyCtt),
      basDataMbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrMbDataQtyCtt),
      basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

    return Object.assign(prodRedisInfo, {
      summary: [prodRedisInfo.summary,
        ProductHelper.convProductSpecifications(prodRedisInfo.summary.basFeeInfo, basDataTxt.txt,
          prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt, basDataTxt.unit, false),
        { smryHtmlCtt: EnvHelper.replaceCdnUrl(this._removePcImgs(prodRedisInfo.summary.smryHtmlCtt)) }].reduce((a, b) => {
        return Object.assign(a, b);
      }),
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
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
    if (!FormatHelper.isEmpty(summaryInfo.smryHtmlCtt)) {
      return '3';
    }

    if (!FormatHelper.isEmpty(summaryInfo.sktProdBenfCtt)) {
      return '2';
    }

    return '1';
  }

  /**
   * @param data
   * @private
   * @see prodGrpYn 그룹형 상품 여부
   * @see repProdId 대표상품 ID
   * @see repVslAplyYn 대표소개 페이지 설정 여부
   * @see prodGrpRepYn 대표상품 여부
   * @see grpProdScrnConsCd 그룹상품화면구성코드
   */
  private _convertContentsInfo (data): any {
    let contentsResult: any = {
        LIST: [],
        LA: null,
        R: null,
        FIRST: null
      };

    // 그룹형 상품 아닐때 case0
    if (FormatHelper.isEmpty(data.prodGrpYn) || data.prodGrpYn !== 'Y') {
      return data.convContents;
    }

    // 대표상품 & 대표소개 미사용 (컨텐츠만 사용) case1
    if (data.prodGrpRepYn === 'Y' && data.repVslAplyYn === 'N') {
      contentsResult = {
        LIST: data.convContents.LIST,
        LA: data.convContents.LA,
        FIRST: data.convContents.FIRST
      };
    }

    // 대표상품 && 대표소개 및 컨텐츠 사용 case2
    if (data.prodGrpRepYn === 'Y' && data.repVslAplyYn === 'Y' && data.grpProdScrnConsCd === 'RRRL') {
      contentsResult = data.convContents;
    }

    // 대표상품 && 대표소개만 사용 case3
    if (data.prodGrpRepYn === 'Y' && data.repVslAplyYn === 'Y' && data.grpProdScrnConsCd === 'RRN') {
      contentsResult.R = data.convContents.R;
    }

    // 종속상품 && 종속 컨텐츠 사용 case4
    if (data.prodGrpRepYn === 'N' && data.repVslAplyYn === 'N') {
      contentsResult = {
        LIST: data.convContents.LIST,
        LA: data.convContents.LA,
        FIRST: data.convContents.FIRST
      };
    }

    // 종속상품 && 대표상품의 대표소개 / 대표상품의 컨텐츠 사용 case 5
    if (data.prodGrpRepYn === 'N' && data.repVslAplyYn === 'Y' && data.grpProdScrnConsCd === 'SRRL') {
      contentsResult = data.convRepContents;
    }

    // 종속상품 && 대표상품의 대표소개 / 종속상품의 컨텐츠 사용 case 6
    if (data.prodGrpRepYn === 'N' && data.repVslAplyYn === 'Y' && data.grpProdScrnConsCd === 'SRSL') {
      contentsResult = {
        R: data.convRepContents.R,
        LIST: data.convContents.LIST,
        LA: data.convContents.LA,
        FIRST: data.convContents.FIRST
      };
    }

    // 종속상품 && 대표상품의 대표소개 / 원장 노출 없음
    if (data.prodGrpRepYn === 'N' && data.repVslAplyYn === 'Y' && data.grpProdScrnConsCd === 'SRN') {
      contentsResult.R = data.convRepContents.R;
    }

    return contentsResult;
  }

  /**
   * @param prodStCd
   * @param contentsInfo
   * @private
   */
  private _convertContents (prodStCd, contentsInfo): any {
    const isOpen = prodStCd === 'E1000',
      contentsResult: any = {
      LIST: [],
      LA: null,
      R: null,
      FIRST: null
    };

    contentsInfo.forEach((item) => {
      if (!isOpen && (item.vslYn && item.vslYn === 'Y')) {
        return true;
      }

      if (item.vslLedStylCd === 'LA' || item.vslLedStylCd === 'R') {
        contentsResult[item.vslLedStylCd] = this._convertContentsHtml(item.ledItmDesc);
        return true;
      }

      if (FormatHelper.isEmpty(contentsResult.FIRST)) {
        contentsResult.FIRST = {
          vslClass: item.vslYn && item.vslYn === 'Y' ? 'prVisual' : 'plm',
          paddingClass: item.vslYn && item.vslYn === 'Y' ? 'nogaps noborder' : '',
          ledItmDesc: this._convertContentsHtml(item.ledItmDesc)
        };

        return true;
      }

      if (FormatHelper.isEmpty(item.titleNm) || FormatHelper.isEmpty(item.ledItmDesc) ||
        item.titleNm === PRODUCT_CALLPLAN.JOIN_TERMINATE_CHANNEL) {
        return true;
      }

      if (!item || item.vslYn === 'N') {
        item.ledItmDesc = FormatHelper.isEmpty(item.ledItmDesc) ? '' : item.ledItmDesc.replace(/(?:\r\n|\r|\n)/g, '<br>');
      }

      contentsResult.LIST.push(Object.assign(item, {
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prVisual' : 'plm'),
        ledItmDesc: this._convertContentsHtml(item.ledItmDesc)
      }));
    });

    return contentsResult;
  }

  /**
   * @param contents
   * @private
   */
  private _convertContentsHtml(contents: any): any {
    if (FormatHelper.isEmpty(contents)) {
      return null;
    }

    contents = this._removePcImgs(contents);
    contents = EnvHelper.replaceCdnUrl(contents);

    if (contents.indexOf('||') === -1) {
      return contents;
    }

    return contents;
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
      bannerResult[item.bnnrLocCd] = Object.assign(item, {
        bnnrDtlHtmlCtt: EnvHelper.replaceCdnUrl(this._removePcImgs(item.bnnrDtlHtmlCtt))
      });
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
   * @param plmProdList
   * @param isJoinedInfo
   * @param svcProdId
   * @private
   */
  private _isJoined (prodTypCd, plmProdList, isJoinedInfo, svcProdId): boolean {
    if (FormatHelper.isEmpty(isJoinedInfo) || isJoinedInfo.code !== API_CODE.CODE_00) {
      return false;
    }

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(prodTypCd) !== -1) {
      return plmProdList.indexOf(svcProdId) !== -1;
    }

    if (['C', 'H_P', 'H_A'].indexOf(prodTypCd) !== -1) {
      return isJoinedInfo.result.isAdditionUse === 'Y';
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(prodTypCd) !== -1) {
      return isJoinedInfo.result.wiredSuplSvcScrbYn === 'Y';
    }

    return isJoinedInfo.result.combiProdScrbYn === 'Y';
  }

  /**
   * @param apiInfo
   * @param isSeries
   * @private
   */
  private _convertSeriesAndRecommendInfo (apiInfo, isSeries): any {
    if (FormatHelper.isEmpty(apiInfo)) {
      return [];
    }

    const list = isSeries ? apiInfo.seriesProdList : apiInfo.recommendProdList;
    return list.map((item) => {
      const basDataGbTxt = FormatHelper.getValidVars(item.basOfrGbDataQtyCtt),
        basDataMbTxt = FormatHelper.getValidVars(item.basOfrMbDataQtyCtt),
        basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

      const convResult = ProductHelper.convProductSpecifications(item.basFeeInfo, basDataTxt.txt,
        item.basOfrVcallTmsCtt, item.basOfrCharCntCtt, basDataTxt.unit, false),
        isSeeContents = convResult.basFeeInfo && convResult.basFeeInfo.value === PRODUCT_CALLPLAN.SEE_CONTENTS;

      return [item, convResult, this._getIsCategory(item.prodTypCd),
        this._getDisplayFlickSlideCondition(item.prodTypCd, isSeeContents, convResult)]
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
    if (similarProductInfo.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(similarProductInfo.result)) {
      return null;
    }

    let titleNm: any = PRODUCT_SIMILAR_PRODUCT.PRODUCT;
    if (prodTypCd === 'AB') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.PLANS;
    }

    if (prodTypCd === 'C') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.ADDITIONS;
    }

    let prodIdsLength: any = 0;
    if (['G', 'F'].indexOf(prodTypCd) !== -1 && similarProductInfo.result.list) {
      let prodIds: any = [];

      similarProductInfo.result.list.forEach((item) => {
        prodIds = prodIds.concat(FormatHelper.isEmpty(item.prodIds) ? [] : item.prodIds.split(','));
      });

      prodIds.reduce((a, b) => {
        if (a.indexOf(b) < 0 ) {
          a.push(b);
        }

        return a;
      }, []);

      prodIdsLength = prodIds.length;
    }

    const prodFltIds: any = FormatHelper.isEmpty(similarProductInfo.result.list) ? '' : similarProductInfo.result.list.map((item) => {
      return item.prodFltId;
    }).join(',');

    return Object.assign(similarProductInfo.result, {
      titleNm: titleNm,
      benefitPath: FormatHelper.isEmpty(BENEFIT_SUBMAIN_CATEGORY[prodFltIds]) ? null : BENEFIT_SUBMAIN_CATEGORY[prodFltIds],
      prodFltIds: prodFltIds,
      prodCnt: ['G', 'F'].indexOf(prodTypCd) !== -1 ? prodIdsLength : similarProductInfo.result.prodCnt
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

    const latestItem = requireDocumentInfo.result.necessaryDocumentInspectInfoList[0];

    if (FormatHelper.isEmpty(latestItem.ciaInsptRslt) ||
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.NORMAL &&
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.ABNORMAL) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT.WORKING,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && !FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT.NEED_DOCUMENT,
        btnText: PRODUCT_REQUIRE_DOCUMENT.APPLY,
        page: 'apply'
      };
    }

    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT.EXPIRE_DOCUMENT,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    return {
      text: PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT.COMPLETE,
      btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
      page: 'history'
    };
  }

  /**
   * @param prodTypCd
   * @private
   */
  private _getIsCategory (prodTypCd: any): any {
    return {
      isMobileplan: prodTypCd === 'AB',
      isMobileplanAdd: prodTypCd === 'C',
      isInternet: ['D_I', 'E_I'].indexOf(prodTypCd) !== -1,
      isWireplan: ['D_I', 'D_P', 'D_T'].indexOf(prodTypCd) !== -1,
      isWireplanAdd: ['E_I', 'E_P', 'E_T'].indexOf(prodTypCd) !== -1,
      isRoaming: ['H_P', 'H_A'].indexOf(prodTypCd) !== -1,
      isCombine: prodTypCd === 'F',
      isDiscount: prodTypCd === 'G'
    };
  }

  /**
   * @param context
   * @private
   */
  private _removePcImgs (context: any): any {
    if (FormatHelper.isEmpty(context)) {
      return null;
    }

    return context.replace(/\/poc\/img\/product\/(.*)(jpg|png|jpeg)/gi, 'data:,');
  }

  /**
   * @param typeCd
   * @private
   */
  private _getReservationTypeCd(typeCd: any): any {
    if (['D_I', 'E_I'].indexOf(typeCd) !== -1) {
      return 'internet';
    }

    if (['D_P', 'E_P'].indexOf(typeCd) !== -1) {
      return 'phone';
    }

    if (['D_T', 'E_T'].indexOf(typeCd) !== -1) {
      return 'tv';
    }

    if (typeCd === 'F') {
      return 'combine';
    }

    return null;
  }

  /**
   * @param prodTypCd
   * @param allSvc
   * @param svcAttrCd
   * @private
   * A: 현재회선으로 가입 가능 && 기준회선 외 다른회선 선택 가능
   * B: 현재회선으로 가입 가능 && 가입가능 회선이 1개
   * C: 현재회선으로 가입 불가능 && 가입가능한 다른 회선 선택 가능
   * D: 현재회선으로 가입 불가능 && 가입불가
   */
  private _getLineProcessCase(prodTypCd: any, allSvc?: any, svcAttrCd?: any): any {
    if (FormatHelper.isEmpty(allSvc) || FormatHelper.isEmpty(svcAttrCd)) {
      return null;
    }

    const allowedSvcAttrInfo: any = this._getAllowedSvcAttrCd(prodTypCd),
      isAllowedCurrentSvcAttrCd: boolean = allowedSvcAttrInfo.svcAttrCds.indexOf(svcAttrCd) !== -1;

    if (FormatHelper.isEmpty(allowedSvcAttrInfo.group)) {
      return 'D';
    }

    const allowedLineLength = this._getAllowedLineLength(allowedSvcAttrInfo.svcAttrCds, allSvc[allowedSvcAttrInfo.group]);

    if (isAllowedCurrentSvcAttrCd && allowedLineLength > 1) {
      return 'A';
    }

    if (isAllowedCurrentSvcAttrCd && allowedLineLength === 1) {
      return 'B';
    }

    if (!isAllowedCurrentSvcAttrCd && allowedLineLength > 0) {
      return 'C';
    }

    return 'D';
  }

  /**
   * @param svcAttrCds
   * @param svcGroupList
   * @private
   */
  private _getAllowedLineLength(svcAttrCds: any, svcGroupList: any): any {
    let length: any = 0;

    svcGroupList.forEach((item) => {
      if (svcAttrCds.indexOf(item.svcAttrCd) !== -1) {
        length++;
      }
    });

    return length;
  }

  /**
   * @param prodTypCd
   * @private
   */
  private _getAllowedSvcAttrCd(prodTypCd: any): any {
    if (['AB', 'C', 'H_P', 'H_A', 'F', 'G'].indexOf(prodTypCd) !== -1) {
      return {
        group: 'm',
        svcAttrCds: ['M1', 'M2', 'M3', 'M4']
      };
    }

    if (['D_I', 'E_I'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S1']
      };
    }

    if (['D_P', 'E_P'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S3']
      };
    }

    if (['D_T', 'E_T'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S2']
      };
    }

    return {
      group: null,
      svcAttrCds: []
    };
  }

  /**
   * basicInfo 10_0001의 plmProdList value중 plmProdId 들을 배열로 만들기
   * @param plmProdList
   * @private
   */
  private _getPlmProdIdsByList(plmProdList: any): any {
    if (FormatHelper.isEmpty(plmProdList)) {
      return [];
    }

    return plmProdList.map((item) => {
      return item.plmProdId;
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      svcInfoProdId = svcInfo ? svcInfo.prodId : null,
      bpcpServiceId = req.query.bpcpServiceId || '',
      eParam = req.query.eParam || '',
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.CALLPLAN
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    if (this._benefitRedirectProdList.indexOf(prodId) !== -1) {
      return res.render('common/callplan/product.common.callplan.redirect.html', Object.assign(renderCommonInfo, {
        redirectUrl: PRODUCT_CALLPLAN_BENEFIT_REDIRECT[prodId],
        svcMgmtNum: svcInfo && svcInfo.svcMgmtNum ? svcInfo.svcMgmtNum : '',
        prodId: prodId
      }));
    }

    this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId])
      .subscribe((basicInfo) => {
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: basicInfo.code,
            msg: basicInfo.msg
          }));
        }

        // 상품 퇴출 상태 (G1000)
        if (basicInfo.result.prodStCd === 'G1000' || FormatHelper.isEmpty(basicInfo.result.prodTypCd)) {
          return this.error.render(res, renderCommonInfo);
        }

        Observable.combineLatest(
          this.apiService.request(API_CMD.BFF_10_0003, {}, {}, [prodId]),
          this.apiService.request(API_CMD.BFF_10_0005, {}, {}, [prodId]),
          this.apiService.request(API_CMD.BFF_10_0006, {}, {}, [prodId]),
          this.apiService.request(API_CMD.BFF_10_0139, {}, {}, [prodId]),
          this.apiService.request(API_CMD.BFF_10_0112, {}, {}, [prodId]),
          this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
          this._getMyContentsData(basicInfo.result.grpProdScrnConsCd, prodId),
          this._getExtendContentsData(basicInfo.result.prodGrpYn, basicInfo.result.repProdId, basicInfo.result.prodGrpRepYn),
          this._getMobilePlanCompareInfo(basicInfo.result.prodTypCd, svcInfoProdId, prodId),
          this._getIsJoined(svcInfo, basicInfo.result.prodTypCd, prodId, basicInfo.result.plmProdList),
          this._getAdditionsFilterListByRedis(basicInfo.result.prodTypCd, prodId),
          this._getCombineRequireDocumentStatus(basicInfo.result.prodTypCd, prodId)
        ).subscribe(([
          relateTagsInfo, seriesInfo, recommendsInfo, recommendsAppInfo, similarProductInfo, prodRedisInfo, prodRedisContentsInfo,
          prodRedisExtendContentsInfo, mobilePlanCompareInfo, isJoinedInfo, additionsProdFilterInfo, combineRequireDocumentInfo
        ]) => {
          const apiError = this.error.apiError([ relateTagsInfo, seriesInfo, prodRedisInfo ]);

          if (!FormatHelper.isEmpty(apiError)) {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              msg: apiError.msg,
              code: apiError.code
            }));
          }

          // 카테고리 및 상품 월정액 서브 텍스트 처리
          const isCategory = this._getIsCategory(basicInfo.result.prodTypCd),
            basFeeSubText: any = isCategory.isWireplan && !FormatHelper.isEmpty(prodRedisInfo.result.summary.feeManlSetTitNm) ?
              prodRedisInfo.result.summary.feeManlSetTitNm : PRODUCT_CALLPLAN_FEEPLAN;

          // 시리즈 상품 처리
          const seriesResult = {
            prodGrpNm : FormatHelper.isEmpty(seriesInfo.result) || FormatHelper.isEmpty(seriesInfo.result.prodGrpNm) ?
              null : seriesInfo.result.prodGrpNm,
            list: this._convertSeriesAndRecommendInfo(seriesInfo.result, true)
          };

          // 대표, 종속상품 처리
          const convContents = FormatHelper.isEmpty(prodRedisContentsInfo.result)
            || FormatHelper.isEmpty(prodRedisContentsInfo.result.contents) ? null :
              this._convertContents(basicInfo.result.prodStCd, prodRedisContentsInfo.result.contents),
            convRepContents = FormatHelper.isEmpty(prodRedisExtendContentsInfo.result)
            || FormatHelper.isEmpty(prodRedisExtendContentsInfo.result.contents) ? null :
              this._convertContents(basicInfo.result.prodStCd, prodRedisExtendContentsInfo.result.contents),
            contentsResult = this._convertContentsInfo({
              convContents,
              convRepContents,
              prodGrpYn: basicInfo.result.prodGrpYn,
              repVslAplyYn: basicInfo.result.repVslAplyYn,
              prodGrpRepYn: basicInfo.result.prodGrpRepYn,
              grpProdScrnConsCd: basicInfo.result.grpProdScrnConsCd
            });

          // 사용자 svcAttrCd
          const svcAttrCd = !FormatHelper.isEmpty(svcInfo) && !FormatHelper.isEmpty(svcInfo.svcAttrCd) ? svcInfo.svcAttrCd : null,
            svcProdId = !FormatHelper.isEmpty(svcInfo) && !FormatHelper.isEmpty(svcInfo.prodId) ? svcInfo.prodId : null;

          res.render('common/callplan/product.common.callplan.html', [renderCommonInfo, isCategory, {
            isPreview: false,
            prodId: prodId,
            prodTitle: prodRedisInfo.result.summary.prodNm,
            basFeeSubText: basFeeSubText,
            series: seriesResult, // 시리즈 상품
            contents: contentsResult, // 상품 콘텐츠
            recommendApps: recommendsAppInfo.result,  // 함께하면 더욱 스마트한 앱 서비스
            mobilePlanCompareInfo: mobilePlanCompareInfo.code !== API_CODE.CODE_00 ? null : mobilePlanCompareInfo.result, // 요금제 비교하기
            additionsProdFilterInfo: additionsProdFilterInfo.code !== API_CODE.CODE_00 ? null : additionsProdFilterInfo.result,  // 부가서비스 카테고리 필터 리스트
            basicInfo: this._convertBasicInfo(basicInfo.result),  // 상품 정보 by Api
            prodRedisInfo: this._convertRedisInfo(basicInfo.result.prodStCd, prodRedisInfo.result), // 상품 정보 by Redis
            relateTags: this._convertRelateTags(relateTagsInfo.result), // 연관 태그
            recommends: this._convertSeriesAndRecommendInfo(recommendsInfo.result, false),  // 함께하면 유용한 상품
            similarProductInfo: this._convertSimilarProduct(basicInfo.result.prodTypCd, similarProductInfo),  // 모바일 요금제 유사한 상품
            isJoined: this._isJoined(basicInfo.result.prodTypCd,
              [...this._getPlmProdIdsByList(basicInfo.result.plmProdList), prodId], isJoinedInfo, svcProdId),  // 가입 여부
            combineRequireDocumentInfo: this._convertRequireDocument(combineRequireDocumentInfo),  // 구비서류 제출 심사내역
            reservationTypeCd: this._getReservationTypeCd(basicInfo.result.prodTypCd),
            lineProcessCase: this._getLineProcessCase(basicInfo.result.prodTypCd, allSvc, svcAttrCd), // 가입 가능 회선 타입
            isProductCallplan: true,
            isAllowJoinCombine: !FormatHelper.isEmpty(allSvc) && !FormatHelper.isEmpty(allSvc.s),
            bpcpServiceId,
            eParam
          }].reduce((a, b) => {
            return Object.assign(a, b);
          }));
        });
      });
  }
}

export default ProductCommonCallplan;
