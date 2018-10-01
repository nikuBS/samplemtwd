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
import { UNIT, VOICE_UNIT } from '../../../types/bff.type';
import { DATA_UNIT } from '../../../types/string.type';

const productApiCmd = {
  'basic': API_CMD.BFF_10_0001,
  'summary': API_CMD.BFF_10_0002,
  'relatetags': API_CMD.BFF_10_0003,
  'contents': API_CMD.BFF_10_0004,
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
      params = { pageType: this._prodId === currentProdId ? 'SP' : 'P' };
    }

    return this.apiService.request(productApiCmd[key], params, {}, this._prodId);
  }

  /**
   * @param key
   * @private
   */
  private _getRedis (key: string): Observable<any> {
    return this.redisService.getData(key + ':' + this._prodId);
  }

  /**
   * @param basicInfo
   * @private
   */
  private _parseBasicInfo (basicInfo): any {
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
   * @param smryVslYn
   * @private
   */
  private _isSummaryVisual (smryVslYn): boolean {
    return smryVslYn === 'Y';
  }

  /**
   * @param summaryInfo
   * @private
   */
  private _parseSummaryInfo (summaryInfo): any {
    return {
      basOfrDataQtyCtt: this._parseBasOfrDataQtyCtt(summaryInfo.basOfrDataQtyCtt),
      basOfrVcallTmsCtt: this._parseBasOfrVcallTmsCtt(summaryInfo.basOfrVcallTmsCtt),
      basOfrCharCntCtt: this._parseBasOfrCharCntCtt(summaryInfo.basOfrCharCntCtt),
      basFeeInfo: this._parsingSummaryBasFeeInfo(summaryInfo.basFeeInfo)
    };
  }

  /**
   * @param basOfrDataQtyCtt
   * @private
   */
  private _parseBasOfrDataQtyCtt (basOfrDataQtyCtt): any {
    if (isNaN(parseInt(basOfrDataQtyCtt, 10))) {
      return basOfrDataQtyCtt;
    }

    return FormatHelper.convDataFormat(basOfrDataQtyCtt, DATA_UNIT.GB);
  }

  /**
   * @param basOfrVcallTmsCtt
   * @private
   */
  private _parseBasOfrVcallTmsCtt (basOfrVcallTmsCtt): any {
    if (isNaN(parseInt(basOfrVcallTmsCtt, 10))) {
      return basOfrVcallTmsCtt;
    }

    return FormatHelper.addComma(basOfrVcallTmsCtt) + VOICE_UNIT.MIN;
  }

  /**
   * @param basOfrCharCntCtt
   * @private
   */
  private _parseBasOfrCharCntCtt (basOfrCharCntCtt): any {
    if (isNaN(parseInt(basOfrCharCntCtt, 10))) {
      return basOfrCharCntCtt;
    }

    return FormatHelper.addComma(basOfrCharCntCtt) + UNIT['310'];
  }

  /**
   * @param basFeeInfo
   * @private
   */
  private _parsingSummaryBasFeeInfo (basFeeInfo): any {
    if (isNaN(parseInt(basFeeInfo, 10))) {
      return basFeeInfo;
    }

    return FormatHelper.addComma(basFeeInfo) + UNIT['110'];
  }

  /**
   * @param contentsVslCd
   * @param contentsInfo
   * @param contentsByRedis
   * @private
   */
  private _parseContentsInfo (contentsVslCd, contentsInfo, contentsByRedis): any {
    let result = contentsInfo.result;

    if (contentsVslCd === 'A') {
      result = { visual: contentsByRedis.contents };
    }

    if (contentsVslCd === 'E') {
      result = Object.assign(contentsInfo.result, { visual: contentsByRedis.contents });
    }

    return result;
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
      this._getApi('summary'),
      this._getApi('relatetags'),
      this._getApi('contents'),
      this._getApi('series'),
      this._getApi('recommands'),
      this._getRedis('ProductLedgerBanner'),
      this._getRedis('ProductLedgerContents'),
      this._getRedis('ProductLedgerSummary')
    ).subscribe(([
      basicInfo, summaryInfo, relateTagsInfo, contentsInfo, seriesInfo,
       recommendsInfo, bannerByRedis, contentsByRedis, summaryByRedis
    ]) => {
      const apiError = this.error.apiError([basicInfo, summaryInfo, relateTagsInfo, contentsInfo, seriesInfo, recommendsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo,
          msg: apiError.msg,
          code: apiError.code
        });
      }

      if (basicInfo.prodStCd === 'G1000') {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo
        });
      }

      res.render('product.detail.html', {
        basicInfo: this._parseBasicInfo(basicInfo.result),
        summary: this._isSummaryVisual(basicInfo.result.smryVslYn) ? summaryByRedis : this._parseSummaryInfo(summaryInfo.result),
        contents: this._parseContentsInfo(basicInfo.contentsVslCd, contentsInfo, contentsByRedis),
        relateTags: relateTagsInfo.result,
        contentsVisual: contentsByRedis,
        series: seriesInfo.result,
        recommends: recommendsInfo.result,
        banner: bannerByRedis,
        svcInfo: svcInfo
      });
    });
  }
}

export default ProductDetail;
