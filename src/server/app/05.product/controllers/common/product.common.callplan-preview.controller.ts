/**
 * 어드민 전용 상품원장 미리보기
 * FileName: product.common.callplan.preview.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.12.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {
  DATA_UNIT,
  PRODUCT_CALLPLAN_FEEPLAN,
  PRODUCT_SIMILAR_PRODUCT,
  PRODUCT_TYPE_NM
} from '../../../../types/string.type';
import { PRODUCT_CALLPLAN, PRODUCT_TYP_CD_LIST } from '../../../../types/bff.type';
import { REDIS_PRODUCT_FILTER } from '../../../../types/redis.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import EnvHelper from '../../../../utils/env.helper';

class ProductCommonCallplanPreview extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param prodInfo
   * @private
   */
  private _convertProdInfo(prodInfo: any): any {
    return [
      prodInfo,
      {
        baseInfo: this._convertBasicInfo(prodInfo.baseInfo),
        relateTags: this._convertRelateTags(prodInfo.prodTagList),
        similars: this._convertSimilarProduct(prodInfo.prodTypCd, prodInfo.similars)
      },
      this._convertRedisInfo({
        summary: prodInfo.summary,
        contents: prodInfo.contentsList,
        banner: prodInfo.bannerList
      })
    ].reduce((a, b) => {
      return Object.assign(a, b);
    });
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
      summary: [prodRedisInfo.summary,
        ProductHelper.convProductSpecifications(prodRedisInfo.summary.basFeeInfo, basDataTxt.txt,
          prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt, basDataTxt.unit),
        { smryHtmlCtt: EnvHelper.setCdnUrl(prodRedisInfo.summary.smryHtmlCtt) }].reduce((a, b) => {
        return Object.assign(a, b);
      }),
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
    if (!FormatHelper.isEmpty(summaryInfo.smryHtmlCtt)) {
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
        contentsResult[item.vslLedStylCd] = EnvHelper.setCdnUrl(item.ledItmDesc);
        return true;
      }

      if (FormatHelper.isEmpty(item.titleNm)) {
        return true;
      }

      if (FormatHelper.isEmpty(contentsResult.PLM_FIRST)) {
        contentsResult.PLM_FIRST = EnvHelper.setCdnUrl(item.ledItmDesc);
        return true;
      }

      contentsResult.LIST.push(Object.assign(item, {
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prCont' : 'plm'),
        ledItmDesc: EnvHelper.setCdnUrl(item.ledItmDesc)
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
      bannerResult[item.bnnrLocCd] = Object.assign(item, {
        bnnrDtlHtmlCtt: EnvHelper.setCdnUrl(item.bnnrDtlHtmlCtt)
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
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.CALLPLAN
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0116, { prodExpsTypCd: 'P' }, {}, prodId),
      this.redisService.getData(REDIS_PRODUCT_FILTER + 'F01230')
    ).subscribe(([prodInfo, additionsProdFilterInfo]) => {
        if (prodInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: prodInfo.code,
            msg: prodInfo.msg
          }));
        }

        const isCategory = this._getIsCategory(prodInfo.result.prodTypCd),
          basFeeSubText: any = isCategory.isWireplan && !FormatHelper.isEmpty(prodInfo.result.summary.feeManlSetTitNm) ?
            prodInfo.result.summary.feeManlSetTitNm : PRODUCT_CALLPLAN_FEEPLAN,
          convertedProdInfo = this._convertProdInfo(prodInfo.result);

        res.render('common/callplan/product.common.callplan.html', [renderCommonInfo, isCategory, {
          isPreview: true,
          prodId: prodId,
          basFeeSubText: basFeeSubText,
          basicInfo: convertedProdInfo.baseInfo,  // 상품 정보 by Api
          prodRedisInfo: {
            summary: convertedProdInfo.summary,
            contents: convertedProdInfo.contents,
            banner: convertedProdInfo.banner
          }, // 상품 정보 by Redis
          relateTags: convertedProdInfo.relateTags, // 연관 태그
          series: this._convertSeriesAndRecommendInfo(convertedProdInfo.prodTypCd, convertedProdInfo.series, true), // 시리즈 상품
          recommends: this._convertSeriesAndRecommendInfo(convertedProdInfo.prodTypCd, convertedProdInfo.recommendProdList, false),  // 함께하면 유용한 상품
          recommendApps: convertedProdInfo.recommendAppList,
          mobilePlanCompareInfo: null, // 요금제 비교하기
          similarProductInfo: convertedProdInfo.similars,  // 모바일 요금제 유사한 상품
          isJoined: false,  // 가입 여부
          additionsProdFilterInfo: additionsProdFilterInfo.code !== API_CODE.CODE_00 ? null : additionsProdFilterInfo.result,  // 부가서비스 카테고리 필터 리스트
          combineRequireDocumentInfo: null  // 구비서류 제출 심사내역
        }].reduce((a, b) => {
          return Object.assign(a, b);
        }));
      });
  }
}

export default ProductCommonCallplanPreview;
