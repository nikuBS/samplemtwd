/**
 * FileName: product.common.callplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { PROD_CTG_CD_CODE } from '../../../../types/bff.type';
import { REDIS_PRODUCT_FILTER, REDIS_PRODUCT_INFO } from '../../../../types/common.type';
import { DATA_UNIT, PRODUCT_CTG_NAME } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

const productApiCmd = {
  'basic': API_CMD.BFF_10_0001,
  'relatetags': API_CMD.BFF_10_0003,
  'series': API_CMD.BFF_10_0005,
  'recommands': API_CMD.BFF_10_0006,
  'additions': API_CMD.BFF_05_0040
};

class ProductCommonCallplan extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  /**
   * @param key
   * @param optionKey
   * @private
   */
  private _getApi (key: string, optionKey?: any): Observable<any> {
    let params = {};
    if (key === 'basic') {
      params = { prodExpsTypCd: 'P' };
    }

    if (key === 'series' && optionKey !== 'F01100') {
      return Observable.of({ code: API_CODE.CODE_00, result: null });
    }

    return this.apiService.request(productApiCmd[key], params, {}, this._prodId);
  }

  /**
   * @param basicInfo
   * @private
   */
  private _convertBasicInfo (basicInfo): any {
    const joinBtnList: any = [],
      settingBtnList: any = [],
      termBtnList: any = [];

    basicInfo.linkBtnList.forEach((item) => {
      if (item.linkTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE') {
        settingBtnList.push(item);
        return true;
      }

      termBtnList.push(item);
    });

    return Object.assign(basicInfo, {
      linkBtnList: {
        join: joinBtnList,
        setting: settingBtnList,
        terminate: termBtnList
      }
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

    return null;
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
      REP: null
    };

    contentsInfo.forEach((item) => {
      if (item.vslLedStylCd === 'R' || item.vslLedStylCd === 'LA') {
        contentsResult[item.vslLedStylCd] = item.ledItmDesc;
        return true;
      }

      if (FormatHelper.isEmpty(item.titleNm)) {
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
   * @param additionsUseInfo
   * @private
   */
  private _isAdditionsJoined (additionsUseInfo): boolean {
    if (additionsUseInfo.code !== API_CODE.CODE_00) {
      return false;
    }

    return additionsUseInfo.result.isAdditionUse === 'Y';
  }

  /**
   * @param seriesInfo
   * @private
   */
  private _convertSeriesInfo (seriesInfo): any {
    if (FormatHelper.isEmpty(seriesInfo)) {
      return null;
    }

    return Object.assign(seriesInfo, {
      seriesProdList: seriesInfo.seriesProdList.map((item) => {
        return Object.assign(item, ProductHelper.convProductSpecifications(item.basFeeInfo, item.basOfrDataQtyCtt,
          item.basOfrVcallTmsCtt, item.basOfrCharCntCtt));
      })
    });
  }

  /**
   * @param ctgCd
   * @private
   */
  private _getCtgKey (ctgCd): any {
    return PROD_CTG_CD_CODE[ctgCd];
  }

  /**
   * @param filtersList
   * @private
   */
  private _getFilterIds (filtersList): any {
    if (FormatHelper.isEmpty(filtersList)) {
      return [];
    }

    return filtersList.map((item) => {
      return item.prodFltId;
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._prodId = req.params.prodId || null;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        title: '상품 상세 정보',
        svcInfo: svcInfo
      });
    }

    this._getApi('basic').subscribe((basicInfo) => {
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            title: '상품 상세 정보',
            code: basicInfo.code,
            msg: basicInfo.msg,
            svcInfo: svcInfo
          });
        }

        if (basicInfo.result.prodStCd === 'G1000') {
          return this.error.render(res, {
            title: '상품 상세 정보',
            svcInfo: svcInfo
          });
        }

        Observable.combineLatest(
          this._getApi('relatetags'),
          this._getApi('series', basicInfo.result.ctgCd),
          this._getApi('recommands'),
          this._getApi('additions'),
          this.redisService.getData(REDIS_PRODUCT_INFO + this._prodId),
          this.redisService.getData(REDIS_PRODUCT_FILTER + 'F01230')
        ).subscribe(([
          relateTagsInfo, seriesInfo, recommendsInfo, additionsInfo, prodRedisInfo, prodFilterInfo
        ]) => {
          const apiError = this.error.apiError([ relateTagsInfo, seriesInfo, recommendsInfo ]);

          if (!FormatHelper.isEmpty(apiError)) {
            return this.error.render(res, {
              title: '상품 상세 정보',
              svcInfo: svcInfo,
              msg: apiError.msg,
              code: apiError.code
            });
          }

          if (FormatHelper.isEmpty(prodRedisInfo)) {
            return this.error.render(res, {
              title: '상품 상세 정보',
              svcInfo: svcInfo
            });
          }

          res.render('common/callplan/product.common.callplan.html', {
            pathCategory: req.path.split('/')[1],
            pageInfo: pageInfo,
            svcInfo: svcInfo,
            prodId: this._prodId,
            basicInfo: this._convertBasicInfo(basicInfo.result),
            prodRedisInfo: this._convertRedisInfo(prodRedisInfo),
            relateTags: this._convertRelateTags(relateTagsInfo.result),
            series: this._convertSeriesInfo(seriesInfo.result),
            recommends: recommendsInfo.result,
            ctgKey: this._getCtgKey(basicInfo.result.ctgCd),
            ctgName: PRODUCT_CTG_NAME[basicInfo.result.ctgCd],
            isAdditionsJoined: this._isAdditionsJoined(additionsInfo),
            filterIds: this._getFilterIds(basicInfo.result.prodFilterFlagList).join(','),
            prodFilterInfo: prodFilterInfo
          });
        });
      });
  }
}

export default ProductCommonCallplan;
