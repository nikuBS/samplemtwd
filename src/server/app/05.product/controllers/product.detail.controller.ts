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
   * @private
   */
  private _getApi (key: string): Observable<any> {
    return this.apiService.request(productApiCmd[key], {}, {}, this._prodId);
  }

  /**
   * @param key
   * @private
   */
  private _getRedis (key: string): Observable<any> {
    return this.redisService.getData(key + ':' + this._prodId);
  }

  /**
   * @param smryVslYn
   * @private
   */
  private _isSummaryVisual (smryVslYn): boolean {
    return smryVslYn === 'Y';
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
      this._getApi('basic'),
      this._getApi('summary'),
      this._getApi('relatetags'),
      this._getApi('contents'),
      this._getApi('series'),
      this._getApi('recommands'),
      this._getRedis('ProductLedgerBanner'),
      this._getRedis('ProductLedgerContents'),
      this._getRedis('ProductLedgerSummary')
    ).subscribe(([
      basicInfo, summary, relateTags, contents, series, recommends, bannerByRedis, contentsByRedis, summaryByRedis
    ]) => {
      const apiError = this.error.apiError([basicInfo, summary, relateTags, contents, series, recommends]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '상품 상세 정보',
          svcInfo: svcInfo,
          msg: apiError.msg,
          code: apiError.code
        });
      }

      res.render('product.detail.html', {
        basicInfo: basicInfo.result,
        summary: this._isSummaryVisual(basicInfo.result.smryVslYn) ? summaryByRedis : summary.result,
        relateTags: relateTags.result,
        contents: contents.result,
        contentsVisual: contentsByRedis,
        series: series.result,
        recommends: recommends.result,
        banner: bannerByRedis
      });
    });
  }
}

export default ProductDetail;
