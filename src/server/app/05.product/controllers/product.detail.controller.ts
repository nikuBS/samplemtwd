/**
 * FileName: product.detail.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PROD_CTG_CD_CODE } from '../../../types/bff.type';
import { PRODUCT_CTG_NAME } from '../../../types/string.type';
import { PRODUCT_SETTING } from '../../../mock/server/product.display-ids.mock';

const productApiCmd = {
  'basic': API_CMD.BFF_10_0001,
  'relatetags': API_CMD.BFF_10_0003,
  'series': API_CMD.BFF_10_0005,
  'recommands': API_CMD.BFF_10_0006,
  'additions': API_CMD.BFF_05_0040
};

class ProductDetail extends TwViewController {
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
      params = { prodExpsTypCd: this._prodId === optionKey ? 'SP' : 'P' };
    }

    if (key === 'series' && optionKey !== 'F01100') {
      return Observable.of({ code: API_CODE.CODE_00, result: null });
    }

    return this.apiService.request(productApiCmd[key], params, {}, this._prodId);
  }

  /**
   * @private
   */
  private _getRedis (): Observable<any> {
    return this.redisService.getData('ProductLedger:' + this._prodId);
  }

  /**
   * @private
   */
  private _isOptionProduct(): boolean {
    let isOption = false;

    Object.keys(PRODUCT_SETTING).forEach((key) => {
      if (PRODUCT_SETTING[key].indexOf(this._prodId) !== -1) {
        isOption = true;
        return false;
      }
    });

    return isOption;
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
      if (item.btnTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.btnTypCd === 'SE') {
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

    return Object.assign(prodRedisInfo, {
      summary: Object.assign(prodRedisInfo.summary, FormatHelper.convProductSpecifications(prodRedisInfo.summary.basFeeInfo,
        prodRedisInfo.summary.basOfrDataQtyCtt, prodRedisInfo.summary.basOfrVcallTmsCtt, prodRedisInfo.summary.basOfrCharCntCtt)),
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
      contents: this._convertContents(prodRedisInfo.contents),
      banner: this._convertBanners(prodRedisInfo.banner)
    });
  }

  /**
   * @param summaryInfo
   * @private
   */
  private _getSummaryCase(summaryInfo): any {
    if (!FormatHelper.isEmpty(summaryInfo.ledDtlHtmlCtt)) {
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
      LE: [],
      LA: null,
      REP: null
    };

    contentsInfo.forEach((item) => {
      if (item.ledStylCd === 'REP' || item.ledStylCd === 'LA') {
        contentsResult[item.ledStylCd] = item.ledDtlHtmlCtt;
        return true;
      }

      if (FormatHelper.isEmpty(contentsResult[item.ledStylCd])) {
        return true;
      }

      contentsResult[item.ledStylCd].push({
        briefTitNm: item.briefTitNm,
        ledDtlHtmlCtt: item.ledDtlHtmlCtt
      });
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
        return Object.assign(item, FormatHelper.convProductSpecifications(item.basFeeInfo, item.basOfrDataQtyCtt,
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        title: '상품 상세 정보',
        svcInfo: svcInfo
      });
    }

    this._getApi('basic', svcInfo.prodId)
      .subscribe((basicInfo) => {
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
          this._getRedis()
        ).subscribe(([
          relateTagsInfo, seriesInfo, recommendsInfo, additionsInfo, prodRedisInfo
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

          res.render('product.detail.html', {
            prodId: this._prodId,
            basicInfo: this._convertBasicInfo(basicInfo.result),
            prodRedisInfo: this._convertRedisInfo(prodRedisInfo),
            relateTags: relateTagsInfo.result,
            series: this._convertSeriesInfo(seriesInfo.result),
            recommends: recommendsInfo.result,
            svcInfo: svcInfo,
            ctgKey: this._getCtgKey(basicInfo.result.ctgCd),
            ctgName: PRODUCT_CTG_NAME[basicInfo.result.ctgCd],
            isAdditionsJoined: this._isAdditionsJoined(additionsInfo),
            filterIds: this._getFilterIds(basicInfo.result.prodFilterFlagList).join(','),
            bodyClass: basicInfo.result.ctgCd === 'F01100' ? 'bg-blue' : 'bg-purple',  // @todo body class
            isOption: this._isOptionProduct()
          });
        });
      });
  }
}

export default ProductDetail;
