/**
 * FileName: product.additions-terminate-success.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.02
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { UNIT } from '../../../types/bff.type';
import { PRODUCT_TYPE } from '../../../types/string.type';
import product_redis_ProductLedgerSummary from '../../../mock/server/product.additions-terminate-success.mock';
import { Observable } from 'rxjs/Observable';

class ProductAdditionsTerminateSuccess extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;
  private _vasDownCell = ['NA00004350', 'NA00005638', 'NA00003202', 'NA00000291', 'NA00001890', 'NA00000290'];  // Vas다운셀 대상 상품

  /**
   * @private
   * @todo mockdata
   */
  private _getRedisData(): Observable<any> {
    return Observable.of(product_redis_ProductLedgerSummary);
    // return this.redisService.getData('ProductLedgerSummary:' + this._prodId);
  }

  /**
   * @param prodSummaryInfo
   * @private
   */
  private _getSimpleProdInfo(prodSummaryInfo): any {
    const baseFeeInfo = isNaN(parseInt(prodSummaryInfo.basFeeInfo, 10)) ? prodSummaryInfo.basFeeInfo
      : FormatHelper.addComma(prodSummaryInfo.basFeeInfo) + UNIT['110'];

    return {
      prodNm: prodSummaryInfo.prodNm,
      basFeeInfo: baseFeeInfo !== PRODUCT_TYPE.FEE_INFO_ETC ? baseFeeInfo : null
    };
  }

  /**
   * @private
   */
  private _isVasDownCellPopup(): any {
    return this._vasDownCell.indexOf(this._prodId) !== -1;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        title: '부가서비스 해지',
        svcInfo: svcInfo
      });
    }


    this._getRedisData().subscribe((redisInfo) => {
      if (FormatHelper.isEmpty(redisInfo)) {
        return this.error.render(res, {
          title: '부가서비스 해지',
          svcInfo: svcInfo
        });
      }

      res.render('product.additions-terminate-success.html', {
        svcInfo: svcInfo,
        prodInfo: this._getSimpleProdInfo(redisInfo.summary),
        isVasDownCell: this._isVasDownCellPopup()
      });
    });
  }
}

export default ProductAdditionsTerminateSuccess;
