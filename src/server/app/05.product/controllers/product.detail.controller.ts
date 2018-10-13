/**
 * FileName: product.detail.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../types/api-command.type';
import { UNIT, PROD_CTG_CD_CODE } from '../../../types/bff.type';
import { PRODUCT_CTG_NAME } from '../../../types/string.type';

const productApiCmd = {
  'basic': API_CMD.BFF_10_0001,
  'relatetags': API_CMD.BFF_10_0003,
  'series': API_CMD.BFF_10_0005,
  'recommands': API_CMD.BFF_10_0006
};

class ProductDetail extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  /**
   * @param key
   * @param currentProdId
   * @private
   */
  private _getApi (key: string, currentProdId?: any): Observable<any> {
    let params = {};
    if (key === 'basic') {
      params = { prodExpsTypCd: this._prodId === currentProdId ? 'SP' : 'P' };
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
      summary: Object.assign(prodRedisInfo.summary, this._parseSummaryInfo(prodRedisInfo.summary)),
      summaryCase: this._getSummaryCase(prodRedisInfo.summary),
      contents: this._convertContents(prodRedisInfo.contents)
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
   * @param summaryInfo
   * @private
   */
  private _parseSummaryInfo (summaryInfo): any {
    return {
      basOfrDataQtyCtt: this._praseBasOfrDataQtyCtt(summaryInfo.basOfrDataQtyCtt),
      basOfrVcallTmsCtt: this._parseBasOfrVcallTmsCtt(summaryInfo.basOfrVcallTmsCtt),
      basOfrCharCntCtt: this._parseBasOfrCharCntCtt(summaryInfo.basOfrCharCntCtt),
      basFeeInfo: this._parsingSummaryBasFeeInfo(summaryInfo.basFeeInfo)
    };
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
   * @param basOfrDataQtyCtt
   * @private
   */
  private _praseBasOfrDataQtyCtt (basOfrDataQtyCtt): any {
    if (basOfrDataQtyCtt === '-') {
      return '';
    }

    return basOfrDataQtyCtt;
  }

  /**
   * @param basOfrVcallTmsCtt
   * @private
   */
  private _parseBasOfrVcallTmsCtt (basOfrVcallTmsCtt): any {
    if (basOfrVcallTmsCtt === '-') {
      return '';
    }

    if (isNaN(parseInt(basOfrVcallTmsCtt, 10))) {
      return basOfrVcallTmsCtt;
    }

    return FormatHelper.addComma(basOfrVcallTmsCtt);
  }

  /**
   * @param basOfrCharCntCtt
   * @private
   */
  private _parseBasOfrCharCntCtt (basOfrCharCntCtt): any {
    if (basOfrCharCntCtt === '-') {
      return '';
    }

    if (isNaN(parseInt(basOfrCharCntCtt, 10))) {
      return basOfrCharCntCtt;
    }

    return FormatHelper.addComma(basOfrCharCntCtt);
  }

  /**
   * @param basFeeInfo
   * @private
   */
  private _parsingSummaryBasFeeInfo (basFeeInfo): any {
    if (isNaN(parseInt(basFeeInfo, 10))) {
      return {
        basFee: basFeeInfo,
        unit: ''
      };
    }

    return {
      basFee: FormatHelper.addComma(basFeeInfo),
      unit: UNIT['110']
    };
  }

  /**
   * @param seriesInfo
   * @private
   */
  private _convertSeriesInfo (seriesInfo): any {
    return Object.assign(seriesInfo, {
      seriesProdList: seriesInfo.seriesProdList.map((item) => {
        const isBasFeeInfo = isNaN(parseInt(item.basFeeInfo, 10));
        return Object.assign(item, {
          basFeeInfo: isBasFeeInfo ? item.basFeeInfo : FormatHelper.addComma(item.basFeeInfo),
          isNumberBasFeeInfo: !isBasFeeInfo
        });
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

    Observable.combineLatest(
      this._getApi('basic', svcInfo.prodId),
      this._getApi('relatetags'),
      this._getApi('series'),
      this._getApi('recommands'),
      this._getRedis()
    ).subscribe(([
      basicInfo, relateTagsInfo, seriesInfo, recommendsInfo, prodRedisInfo
    ]) => {
      const apiError = this.error.apiError([ basicInfo, relateTagsInfo, seriesInfo, recommendsInfo ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo,
          msg: apiError.msg,
          code: apiError.code
        });
      }

      if (basicInfo.result.prodStCd === 'G1000') {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo
        });
      }

      if (FormatHelper.isEmpty(prodRedisInfo)) {
        return this.error.render(res, { svcInfo: svcInfo });
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
        filterIds: this._getFilterIds(basicInfo.result.prodFilterFlagList).join(',')
      });
    });
  }
}

export default ProductDetail;
