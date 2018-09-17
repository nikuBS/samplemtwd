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

  /**
   * @param prodId
   * @param key
   * @private
   */
  private _getApi (prodId, key): Observable<any> {
    return this.apiService.request(productApiCmd[key], {}, {}, prodId);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const prodId = req.params.prodId;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        title: '상품 상세',
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this._getApi(prodId, 'basic'),
      this._getApi(prodId, 'summary'),
      this._getApi(prodId, 'relatetags'),
      this._getApi(prodId, 'contents'),
      this._getApi(prodId, 'series'),
      this._getApi(prodId, 'recommands'),
    ).subscribe(([basicInfo, summary, relateTags, contents, series, recommends]) => {
      const apiError = this.error.apiError([basicInfo, summary, relateTags, contents, series, recommends]);
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          title: '상품 상세',
          svcInfo: svcInfo
        });
      }

      res.render('product.detail.html', {
        basicInfo: basicInfo.result,
        summary: summary.result,
        relateTags: relateTags.result,
        contents: contents.result,
        series: series.result,
        recommends: recommends.result
      });
    });
  }
}

export default ProductDetail;
