/**
 * FileName: product.detail.contents.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class ProductDetailContents extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param contentsVslCd
   * @param contentsInfo
   * @param contentsByRedis
   * @private
   */
  private _parseContents (contentsVslCd, contentsInfo, contentsByRedis): any {
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
    const prodId = req.params.prodId;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        title: '상품 상세보기',
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0004, {}, {}, prodId),
      this.redisService.getData('ProductLedgerContents:' + prodId)
    ).subscribe(([ basicInfo, contentsInfo, contentsByRedis ]) => {
      res.render('product.detail.contents.html', {
        svcInfo: svcInfo,
        contents: this._parseContents(basicInfo.contentsVslCd, contentsInfo, contentsByRedis)
      });
    });
  }
}

export default ProductDetailContents;
