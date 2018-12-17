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
        baseInfo: this._convertBasicInfo(Object.assign(prodInfo.baseInfo, {
          linkBtnList: prodInfo.linkBtnList
        })),
        relateTags: this._convertRelateTags(prodInfo.prodTagList),
        similar: this._convertSimilarProduct(prodInfo.baseInfo.prodTypCd, prodInfo.similar)
      },
      this._convertRedisInfo('E1000', {
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
          prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt, basDataTxt.unit),
        { smryHtmlCtt: EnvHelper.replaceCdnUrl(prodRedisInfo.summary.smryHtmlCtt) }].reduce((a, b) => {
        return Object.assign(a, b);
      }),
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
      contents: this._convertContents(prodStCd, prodRedisInfo.contents),
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
        contentsResult[item.vslLedStylCd] = EnvHelper.replaceCdnUrl(this._removePcImgs(item.ledItmDesc));
        return true;
      }

      if (FormatHelper.isEmpty(contentsResult.FIRST)) {
        contentsResult.FIRST = {
          vslClass: item.vslYn && item.vslYn === 'Y' ? 'prVisual' : 'plm',
          ledItmDesc: EnvHelper.replaceCdnUrl(this._removePcImgs(item.ledItmDesc))
        };

        return true;
      }

      if (FormatHelper.isEmpty(item.titleNm)) {
        return true;
      }

      contentsResult.LIST.push(Object.assign(item, {
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prVisual' : 'plm'),
        ledItmDesc: EnvHelper.replaceCdnUrl(this._removePcImgs(item.ledItmDesc))
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
        bnnrDtlHtmlCtt: EnvHelper.replaceCdnUrl(item.bnnrDtlHtmlCtt)
      });
    });

    return bannerResult;
  }

  /**
   * @param relateTags
   * @private
   */
  private _convertRelateTags (relateTags: any): any {
    if (FormatHelper.isEmpty(relateTags)) {
      return [];
    }

    return relateTags;
  }

  /**
   * @param prodTypCd
   * @param list
   * @private
   */
  private _convertSeriesAndRecommendInfo (prodTypCd, list): any {
    if (FormatHelper.isEmpty(list)) {
      return null;
    }

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
    let titleNm: any = PRODUCT_SIMILAR_PRODUCT.PRODUCT;
    if (prodTypCd === 'AB') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.PLANS;
    }

    if (prodTypCd === 'C') {
      titleNm = PRODUCT_SIMILAR_PRODUCT.ADDITIONS;
    }

    let prodIdsLength: any = 0;
    if (prodTypCd === 'G') {
      let prodIds: any = [];

      similarProductInfo.similarsList.forEach((item) => {
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

    return Object.assign(similarProductInfo, {
      titleNm: titleNm,
      prodFltIds: FormatHelper.isEmpty(similarProductInfo.similarsList) ? '' : similarProductInfo.similarsList.map((item) => {
        return item.prodFltId;
      }).join(','),
      prodCnt: prodTypCd === 'G' ? prodIdsLength : similarProductInfo.prodCnt,
      list: similarProductInfo.similarsList
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

  /**
   * @param context
   * @private
   */
  private _removePcImgs (context: any): any {
    if (FormatHelper.isEmpty(context)) {
      return null;
    }

    return context.replace(/\/poc\/img\/product\/(.*)(jpg|png|jpeg)/gi, '');
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
      this.apiService.request(API_CMD.BFF_10_0116, {}, {}, prodId),
      this.redisService.getData(REDIS_PRODUCT_FILTER + 'F01230')
    ).subscribe(([prodInfo, additionsProdFilterInfo]) => {
        if (prodInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: prodInfo.code,
            msg: prodInfo.msg
          }));
        }

        const isCategory = this._getIsCategory(prodInfo.result.baseInfo.prodTypCd),
          basFeeSubText: any = isCategory.isWireplan && !FormatHelper.isEmpty(prodInfo.result.summary.feeManlSetTitNm) ?
            prodInfo.result.summary.feeManlSetTitNm : PRODUCT_CALLPLAN_FEEPLAN,
          convertedProdInfo = this._convertProdInfo(prodInfo.result);

        res.render('common/callplan/product.common.callplan.html', [renderCommonInfo, isCategory, {
          isPreview: true,
          prodId: prodId,
          basFeeSubText: basFeeSubText,
          basicInfo: convertedProdInfo.baseInfo,  // 상품 정보 by Api
          prodRedisInfo: {
            summary: Object.assign(convertedProdInfo.baseInfo, convertedProdInfo.summary),
            summaryCase: convertedProdInfo.summaryCase,
            contents: convertedProdInfo.contents,
            banner: convertedProdInfo.banner
          }, // 상품 정보 by Redis
          relateTags: convertedProdInfo.relateTags, // 연관 태그
          series: FormatHelper.isEmpty(prodInfo.result.seriesProdList) ? null :
            this._convertSeriesAndRecommendInfo(convertedProdInfo.prodTypCd, prodInfo.result.seriesProdList), // 시리즈 상품
          recommends: FormatHelper.isEmpty(prodInfo.result.recommendProdList) ? null :
            this._convertSeriesAndRecommendInfo(convertedProdInfo.prodTypCd, prodInfo.result.recommendProdList),  // 함께하면 유용한 상품
          recommendApps: FormatHelper.isEmpty(convertedProdInfo.recommendAppList) ? null : { recommendAppList: convertedProdInfo.recommendAppList },
          mobilePlanCompareInfo: null, // 요금제 비교하기
          similarProductInfo: convertedProdInfo.similar,  // 모바일 요금제 유사한 상품
          isJoined: true,  // 가입 여부
          additionsProdFilterInfo: additionsProdFilterInfo.code !== API_CODE.CODE_00 ? null : additionsProdFilterInfo.result,  // 부가서비스 카테고리 필터 리스트
          combineRequireDocumentInfo: null  // 구비서류 제출 심사내역
        }].reduce((a, b) => {
          return Object.assign(a, b);
        }));
      });
  }
}

export default ProductCommonCallplanPreview;
