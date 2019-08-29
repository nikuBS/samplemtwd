/**
 * 상품 > 원장(상세)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-09-11
 *
 * @see prodStCd 상품운영상태코드 (G1000: 퇴출, F1000: 가입중단, E1000: 운영)
 * @see prodTypCd 상품유형코드 (AB: 무선 요금제, C: 무선 부가서비스, D_I/D_P/D_T: 유선 요금제(인터넷/전화/TV),
 *  E_I/E_P/E_T: 유선 부가서비스(인터넷/전화/TV), H_P/H_A: 로밍 요금제/부가서비스, F: 결합상품, G: 할인프로그램
 * @see grpProdScrnConsCd 그룹상품화면구성코드 (RRRL: 원장의 내용 포함, RRN : 대표 소개만 제공, SRRL : 대표원장과 동일, SRSL : 대표소개와 종속원장 포함, SRN : 원장노출 없음)
 * @see vslLedStylCd 원장스타일코드 (LA:원장전체, LE: 원장개요별, R: 대표,*PLM 정보일 경우(vslYn이 'N') 값이 존재하지 않습니다.))
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
  PRODUCT_CALLPLAN_BENEFIT_REDIRECT, PRODUCT_TYP_CD_LIST, LIVE_CHAT_CHECK_PROD_ID} from '../../../../types/bff.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import EnvHelper from '../../../../utils/env.helper';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 */
class ProductCommonCallplan extends TwViewController {
  constructor() {
    super();
  }

  /* 결합/혜택 리디렉션 대상 상품코드 */
  private readonly _benefitRedirectProdList = ['TW20000014', 'TW20000018', 'TW20000019'];

  /**
   * 요금제 비교하기 Redis 정보 호출
   * @param prodTypCd - 상품 유형코드
   * @param svcInfoProdId - 사용자 세션데이터의 상품코드
   * @param prodId - 상품원장 상품코드
   */
  private _getMobilePlanCompareInfo(prodTypCd: any, svcInfoProdId: any, prodId: any): Observable<any> {
    if (prodTypCd !== 'AB' || FormatHelper.isEmpty(svcInfoProdId)) {  // 모바일 요금제만 비교하기 Redis 확인
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + svcInfoProdId + '/' + prodId);
  }

  /**
   * 가입여부 확인
   * @param svcInfo - 사용자 세션데이터
   * @param prodTypCd - 상품 유형코드
   * @param prodId - 상품원장 상품코드
   * @param plmProdList - 10_0001의 연결된 상품코드 배열
   */
  private _getIsJoined(svcInfo: any, prodTypCd: any, prodId: any, plmProdList?: any): Observable<any> {
    if (FormatHelper.isEmpty(svcInfo)) {
      return Observable.of({});
    }

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(prodTypCd) !== -1) {  // 무선 요금제, 유선 요금제는 별도 API 호출로 가입여부를 판단하지 않으므로
      return Observable.of({ code: '00' });
    }

    // 연결된 상품코드 배열값을 같이 넘겨주어 가입여부 판단시 사용하도록 한다.
    const reqParams = FormatHelper.isEmpty(plmProdList) ? {} : { mappProdIds: (plmProdList.map((item) => {
        return item.plmProdId;
      })).join(',') };

    // 모바일 부가서비스, 로밍 요금제/부가서비스
    if (['C', 'H_P', 'H_A'].indexOf(prodTypCd) !== -1) {
      return this.apiService.request(API_CMD.BFF_05_0040, reqParams, {}, [prodId]);
    }

    // 유선 부가서비스
    if (['E_I', 'E_P', 'E_T'].indexOf(prodTypCd) !== -1) {
      return this.apiService.request(API_CMD.BFF_10_0109, reqParams, {}, [prodId]);
    }

    // 결합상품, 할인프로그램
    return this.apiService.request(API_CMD.BFF_10_0119, {}, {}, [prodId]);
  }

  /**
   * 모바일 부가서비스 카테고리 필터 리스트 Redis 호출
   * @param prodTypCd - 상품 유형코드
   * @param prodId - 상품원장 상품코드
   */
  private _getAdditionsFilterListByRedis(prodTypCd: any, prodId: any): Observable<any> {
    if (prodTypCd !== 'C') {  // 모바일 부가서비스만 사용
      return Observable.of({ code: null });
    }

    return this.redisService.getData(REDIS_KEY.PRODUCT_FILTER + 'F01230');
  }

  /**
   * 인터넷/TV/전화, 결합상품 구비서류 심사내역 조회
   * @param prodTypCd - 상품 유형코드
   * @param prodId - 상품원장 상품코드
   */
  private _getCombineRequireDocumentStatus(prodTypCd: any, prodId: any): Observable<any> {
    if (['D_I', 'D_P', 'D_T', 'F'].indexOf(prodTypCd) === -1) { // 유선 요금제, 결합상품만 사용
      return Observable.of({});
    }

    const reqParams: any = {};
    if (FormatHelper.isEmpty(prodId)) {
      reqParams.svcProdCd = prodId === 'NH00000083' ? 'NH00000084' : prodId;  // 특정 상품코드의 경우 조회용 코드가 서로 상이함.
    }

    return this.apiService.request(API_CMD.BFF_10_0078, reqParams);
  }

  /**
   * 상품 콘텐츠 조회 (self)
   * @param prodStCd - 상품 상태코드
   * @param grpProdScrnConsCd - 콘텐츠 그룹 유형
   * @param prodId - 상품원장 상품코드
   */
  private _getMyContentsData(prodStCd: any, grpProdScrnConsCd: any, prodId: any): any {
    if (grpProdScrnConsCd === 'SRRL' && prodStCd === 'E1000') { // 대표 원장과 동일하므로 별도 redis 가져올 필요 없음
      return Observable.of({});
    }

    const contentsRedisKey: any = prodStCd === 'E1000' ? REDIS_KEY.PRODUCT_CONTETNS : REDIS_KEY.PRODUCT_PLM_CONTENTS;
    return this.redisService.getData(contentsRedisKey + prodId);
  }

  /**
   * 상품 콘텐츠 조회 (parent)
   * @param prodStCd - 상품 상태코드
   * @param prodGrpYn - 콘텐츠 그룹 여부
   * @param repProdId - 대표 상품 상품코드
   * @param prodGrpRepYn - 콘텐츠 그룹의 대표 원장 여부
   */
  private _getExtendContentsData(prodStCd: any, prodGrpYn: any, repProdId: any, prodGrpRepYn: any): any {
    if ((prodGrpYn !== 'Y' || prodGrpRepYn === 'Y') && prodStCd === 'E1000' || prodStCd !== 'E1000') {  // 그룹원장이 아니거나 그룹의 대표 원장일 경우 이미 갖고오는 부분이 있으므로
      return Observable.of({});
    }

    const contentsRedisKey: any = prodStCd === 'E1000' ? REDIS_KEY.PRODUCT_CONTETNS : REDIS_KEY.PRODUCT_PLM_CONTENTS;
    return this.redisService.getData(contentsRedisKey + repProdId);
  }

  /**
   * BFFNo. 10_0001 기본 정보 데이터 변환
   * @param basicInfo - 기본정보 API 응답 값
   */
  private _convertBasicInfo (basicInfo): any {
    const joinBtnList: any = [],
      settingBtnList: any = [],
      termBtnList: any = [];

    let isJoinReservation: any = false;

    // 버튼 정리
    basicInfo.linkBtnList.forEach((item) => {
      if (item.linkTypCd === 'SE' && basicInfo.prodSetYn !== 'Y') { // 설정 버튼 & 설정가능 상태가 아닐때
        return true;
      }

      if (item.linkTypCd === 'SC') {  // 가입
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE' && basicInfo.prodSetYn === 'Y') { // 설정 버튼 & 설정가능
        settingBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'CT') {  // 가입상담예약
        isJoinReservation = true;
        return true;
      }

      termBtnList.push(item); // 해지버튼
    });

    return Object.assign(basicInfo, {
      prodTypListPath: PRODUCT_TYP_CD_LIST[basicInfo.prodTypCd],  // 상품별 인덱스 리스트가 다르므로
      linkBtnList: {
        join: joinBtnList,
        setting: settingBtnList,
        terminate: termBtnList
      },
      isJoinReservation: isJoinReservation
    });
  }

  /**
   * 상품 기본정보 레디스 데이터 변환
   * @param prodStCd - 상품운영상태코드; 이 값에 따라 분기처리를 함
   * @param prodRedisInfo - 상품 기본정보 레디스 데이터
   */
  private _convertRedisInfo (prodStCd, prodRedisInfo): any {
    if (FormatHelper.isEmpty(prodRedisInfo)) {
      return {};
    }

    const basDataGbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrGbDataQtyCtt), // GB 단위값
      basDataMbTxt = FormatHelper.getValidVars(prodRedisInfo.summary.basOfrMbDataQtyCtt), // MB 단위값
      basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt); // 있는 값을 쓰자 (GB 우선)

    return Object.assign(prodRedisInfo, {
      // 상품 요약데이터
      summary: [prodRedisInfo.summary,
        ProductHelper.convProductSpecifications(prodRedisInfo.summary.basFeeInfo, basDataTxt.txt,
          prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt, basDataTxt.unit, false),
        { smryHtmlCtt: EnvHelper.replaceCdnUrl(this._removePcImgs(prodRedisInfo.summary.smryHtmlCtt)) }].reduce((a, b) => {
        return Object.assign(a, b);
      }),
      // 상품 요약 데이터 분기처리
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
      // 상품원장 내 배너 데이터
      banner: this._convertBanners(prodRedisInfo.banner)
    });
  }

  /**
   * 두개의 데이터값 필드 중 GB 값을 우선하여 출력
   * @param basDataGbTxt - GB 단위
   * @param basDataMbTxt - MB 단위
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
   * 상품 요약데이터 분기처리용 케이스 처리
   * @param summaryInfo - 상품 요약정보(Redis)
   */
  private _getSummaryCase(summaryInfo): any {
    if (!FormatHelper.isEmpty(summaryInfo.smryHtmlCtt)) { // 요약 시각화 Html 이 있으면 3
      return '3';
    }

    if (!FormatHelper.isEmpty(summaryInfo.sktProdBenfCtt)) {  // 그 다음에 SKT혜택이 있으면 2
      return '2';
    }

    return '1'; // 그외 1
  }

  /**
   * 콘텐츠 데이터 그룹 처리
   * @param prodStCd - 상품운영상태코드
   * @param data - 콘텐츠 데이터
   * @see prodGrpYn - 그룹형 상품 여부
   * @see repProdId - 대표상품 ID
   * @see repVslAplyYn - 대표소개 페이지 설정 여부
   * @see prodGrpRepYn - 대표상품 여부
   * @see grpProdScrnConsCd - 그룹상품화면구성코드 (최상단 see 참조)
   */
  private _convertContentsInfo (prodStCd, data): any {
    let contentsResult: any = {
        LIST: [],
        LA: null,
        R: null,
        FIRST: null
      };

    // 그룹형 상품 아닐때 case0
    if (FormatHelper.isEmpty(data.prodGrpYn) || data.prodGrpYn !== 'Y' ||
      FormatHelper.isEmpty(data.convContents) && FormatHelper.isEmpty(data.convRepContents) || prodStCd !== 'E1000') {
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
   * 콘텐츠 데이터 변환
   * @param prodStCd - 상품운영상태코드; 이 값에 따라 분기처리함
   * @param contentsInfo - 콘텐츠 데이터
   */
  private _convertContents (prodStCd, contentsInfo): any {
    const isOpen = prodStCd === 'E1000',
      contentsResult: any = {
      LIST: [], // 콘텐츠 목록
      LA: null, // 원장 전체
      R: null,  // 대표
      FIRST: null // 첫번째 노출 콘텐츠
    };

    contentsInfo.forEach((item) => {
      if (!isOpen && (item.vslYn && item.vslYn === 'Y')) {  // 미오픈 상태일때는 시각화 원장을 사용하지 않으므로 skip
        return true;
      }

      if (isOpen && (!item.vslYn || item.vslYn && item.vslYn === 'N' && item.vslLedStylCd === null)) {  // 오픈 상태일때는 비시각화 원장 미사용 처리
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

      if (FormatHelper.isEmpty(item.titleNm) || FormatHelper.isEmpty(item.ledItmDesc)) {
        return true;
      }

      contentsResult.LIST.push(Object.assign(item, {
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prVisual' : 'plm'),
        ledItmDesc: this._convertContentsHtml(item.ledItmDesc)
      }));
    });

    return contentsResult;
  }

  /**
   * 콘텐츠 마크업 보정
   * @param contents - 콘텐츠 마크업
   */
  private _convertContentsHtml(contents: any): any {
    if (FormatHelper.isEmpty(contents)) {
      return null;
    }

    contents = this._removePcImgs(contents);
    contents = EnvHelper.replaceCdnUrl(contents);

    return contents;
  }

  /**
   * 배너 데이터 변환
   * @param bannerInfo - 배너 데이터
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
   * 연관태그 빈값 예외 처리
   * @param relateTags - 연관태그 데이터
   */
  private _convertRelateTags (relateTags: any): any {
    if (FormatHelper.isEmpty(relateTags.prodTagList)) {
      return [];
    }

    return relateTags.prodTagList;
  }

  /**
   * 가입여부 API 응답값 상품유형코드별 처리
   * @param prodTypCd - 상품유형코드
   * @param plmProdList - 10_0001 연결된 상품코드배열
   * @param isJoinedInfo - API 응답값
   * @param svcProdId - 사용자 세션데이터 내 상품코드
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
   * 시리즈/추천 상품 데이터 변환
   * @param apiInfo - API 응답 값
   * @param isSeries - 시리즈 상품 여부
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
   * 시리즈/추천 상품 데이터별 노출 유형 처리
   * @param prodTypCd - 상품유형코드
   * @param isSeeContents - 가격 값이 "상세참조" 일 경우
   * @param convResult - 상품 데이터
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
   * 유사한 상품 데이터 변환
   * @param prodTypCd - 상품유형코드
   * @param similarProductInfo - 유사한 상품 API 응답 값
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
   * 채널별 가입/해지 안내문구 조회
   * @param prodTypCd - 상품유형코드
   * @param channelGuidmsgInfo - 채널별 가입/해지 안내문구 조회 API 응답 값
   */
  private _channelScrbtermGuidmsg (isApp: any , channelGuidmsgInfo: any) {
    if (channelGuidmsgInfo.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(channelGuidmsgInfo.result)) {
      return null;
    }

    const pcScrbTermYn: any = channelGuidmsgInfo.result.prodScrbTermGuidList.map((item) => {
            return item.pcScrbTermYn;
    }),
          mwScrbTermYn: any = channelGuidmsgInfo.result.prodScrbTermGuidList.map((item) => {
            return item.mwScrbTermYn;
    }),
          appScrbTermYn: any = channelGuidmsgInfo.result.prodScrbTermGuidList.map((item) => {
            return item.appScrbTermYn;
    }),
          scrbTermGuidCd: any = channelGuidmsgInfo.result.prodScrbTermGuidList.map((item) => {
            return item.scrbTermGuidCd;
    }),
          scrbTermGuidMsgCtt: any = channelGuidmsgInfo.result.prodScrbTermGuidList.map((item) => {
            return item.scrbTermGuidMsgCtt;
    }),
          mwApp: any = mwScrbTermYn + appScrbTermYn,
          pcMwApp: any = pcScrbTermYn + mwScrbTermYn + appScrbTermYn;

    const msg: any =  this._channelGuid(isApp, pcMwApp);

    return Object.assign(channelGuidmsgInfo.result, {
      pcScrbTermYn: pcScrbTermYn,
      mwScrbTermYn: mwScrbTermYn,
      appScrbTermYn: appScrbTermYn,
      scrbTermGuidCd: scrbTermGuidCd,
      scrbTermGuidMsgCtt: scrbTermGuidMsgCtt,
      mwApp: mwApp,
      msg: msg
    });
  }

  /**
   * 자동 채널별 안내 문구
   * @param isApp - 앱 여부
   * @param pcMwApp - 채널별 가입불가 구분코드
   */
  private _channelGuid (isApp: any, pcMwApp: any): any {

    if ( pcMwApp === 'NNN' ) {
      return '고객센터 또는 지점/대리점에서 가입이 가능합니다.';
    } else if ( pcMwApp === 'YNN' ) {
      return 'PC 웹사이트(www.tworld.co.kr)에서 가입이 가능합니다.';
    } else if ( pcMwApp === 'YNY' && !isApp ) {
      return 'PC 웹사이트 또는 모바일 T월드(APP)에서 가입이 가능합니다.';
    } else if ( pcMwApp === 'NNY' && !isApp ) {
      return '모바일 T월드(APP)에서 가입이 가능합니다.';
    } else if ( pcMwApp === 'YYN' && isApp ) {
      return 'PC 웹사이트(www.tworld.co.kr) 또는 모바일 웹사이트(m.tworld.co.kr)에서 가입이 가능합니다.';
    } else if ( pcMwApp === 'NYN' && isApp ) {
      return '모바일 웹사이트(m.tworld.co.kr)에서 가입이 가능합니다.';
    }
    return null;
  }

  /**
   * 상담예약 서류제출여부 값 처리
   * @param requireDocumentInfo - 심사내역 조회 응답 값
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
   * 상품유형코드별 boolean 처리
   * @param prodTypCd - 상품유형코드
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
   * 상품시각화 원장 내 온T 이미지 제거
   * @param context - 시각화 원장 마크업
   */
  private _removePcImgs (context: any): any {
    if (FormatHelper.isEmpty(context)) {
      return null;
    }

    return context.replace(/\/poc\/img\/product\/(.*)(jpg|png|jpeg)/gi, 'data:,');
  }

  /**
   * 가입상담예약 상품유형코드별 카테고리 값 산출
   * @param typeCd - 상품유형코드
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
   * 요금제변경/가입시 회선변경 Process 진입유형 계산
   * @param prodTypCd - 상품유형코드
   * @param allSvc - 사용자 회선 데이터
   * @param svcAttrCd - 현재 회선의 유형 값
   * @return 회선변경 Process Case
   * @see A: 현재회선으로 가입 가능 && 기준회선 외 다른회선 선택 가능
   * @see B: 현재회선으로 가입 가능 && 가입가능 회선이 1개
   * @see C: 현재회선으로 가입 불가능 && 가입가능한 다른 회선 선택 가능
   * @see D: 현재회선으로 가입 불가능 && 가입불가
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
   * 접근가능 회선 개수 계산
   * @param svcAttrCds - 사용자의 회선 유형 배열
   * @param svcGroupList - 접근 가능 회선 유형 코드 배열
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
   * 접근가능 회선 유형 계산
   * @param prodTypCd - 상품 유형
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
   * @param plmProdList - 연결된 상품코드 배열
   */
  private _getPlmProdIdsByList(plmProdList: any): any {
    if (FormatHelper.isEmpty(plmProdList)) {
      return [];
    }

    return plmProdList.map((item) => {
      return item.plmProdId;
    });
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
      bpcpServiceId = req.query.bpcpServiceId || '',
      eParam = req.query.eParam || '',
      liveChatCheckProdId = LIVE_CHAT_CHECK_PROD_ID.indexOf(prodId) > -1,
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
          this.apiService.request(API_CMD.BFF_10_0180, { scrbTermCd: 'A' }, {}, [prodId]),
          this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
          this._getMyContentsData(basicInfo.result.prodStCd, basicInfo.result.grpProdScrnConsCd, prodId),
          this._getExtendContentsData(basicInfo.result.prodStCd, basicInfo.result.prodGrpYn,
            basicInfo.result.repProdId, basicInfo.result.prodGrpRepYn),
          this._getMobilePlanCompareInfo(basicInfo.result.prodTypCd, svcInfoProdId, prodId),
          this._getIsJoined(svcInfo, basicInfo.result.prodTypCd, prodId, basicInfo.result.plmProdList),
          this._getAdditionsFilterListByRedis(basicInfo.result.prodTypCd, prodId),
          this._getCombineRequireDocumentStatus(basicInfo.result.prodTypCd, prodId)
        ).subscribe(([
          relateTagsInfo, seriesInfo, recommendsInfo, recommendsAppInfo, similarProductInfo, channelGuidmsgInfo, prodRedisInfo, prodRedisContentsInfo,
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
            contentsResult = this._convertContentsInfo(basicInfo.result.prodStCd, {
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
            channelGuidmsgInfo: this._channelScrbtermGuidmsg(BrowserHelper.isApp(req), channelGuidmsgInfo),  // 채널별 가입/해지 안내문구 조회
            isJoined: this._isJoined(basicInfo.result.prodTypCd,
              [...this._getPlmProdIdsByList(basicInfo.result.plmProdList), prodId], isJoinedInfo, svcProdId),  // 가입 여부
            combineRequireDocumentInfo: this._convertRequireDocument(combineRequireDocumentInfo),  // 구비서류 제출 심사내역
            reservationTypeCd: this._getReservationTypeCd(basicInfo.result.prodTypCd),
            lineProcessCase: this._getLineProcessCase(basicInfo.result.prodTypCd, allSvc, svcAttrCd), // 가입 가능 회선 타입
            isProductCallplan: true,
            isAllowJoinCombine: !FormatHelper.isEmpty(allSvc) && !FormatHelper.isEmpty(allSvc.s),
            loggedYn: !FormatHelper.isEmpty(svcInfo) ? 'Y' : 'N',
            bpcpServiceId,
            eParam,
            liveChatCheckProdId, // 실시간 채팅 상담 추가 상품
            isApp: BrowserHelper.isApp(req),
            svcProdId: svcProdId
          }].reduce((a, b) => {
            return Object.assign(a, b);
          }));
        });
      });
  }
}

export default ProductCommonCallplan;
