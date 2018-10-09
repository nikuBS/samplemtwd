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
      params = { pageType: this._prodId === currentProdId ? 'SP' : 'P' };
    }

    return this.apiService.request(productApiCmd[key], params, {}, this._prodId);
  }

  /**
   * @private
   */
  private _getRedis (): Observable<any> {
    this.logger.info(this, '[REDIS] ProductLedger:' + this._prodId);
    return this.redisService.getData('ProductLedger:' + this._prodId);
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

  private _parseRedisInfo (prodRedisInfo, smryVslYn): any {
    if (FormatHelper.isEmpty(prodRedisInfo)) {
      return {};
    }

    return Object.assign(prodRedisInfo, {
      summary: Object.assign(prodRedisInfo.summary, this._parseSummaryInfo(smryVslYn, prodRedisInfo.summary))
    });
  }

  /**
   * @param smryVslYn
   * @param summaryInfo
   * @private
   */
  private _parseSummaryInfo (smryVslYn, summaryInfo): any {
    if (smryVslYn === 'Y') {
      return {};
    }

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

    return FormatHelper.addComma(basFeeInfo);
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

      if (basicInfo.prodStCd === 'G1000') {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo
        });
      }

      res.render('product.detail.html', {
        basicInfo: this._parseBasicInfo(basicInfo.result),
        prodRedisInfo: this._parseRedisInfo(prodRedisInfo, basicInfo.smryVslYn),
        relateTags: relateTagsInfo.result,
        series: seriesInfo.result,
        recommends: recommendsInfo.result,
        svcInfo: svcInfo
      });
    });
  }
}

export default ProductDetail;
