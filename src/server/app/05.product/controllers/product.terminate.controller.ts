/**
 * FileName: product.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { UNIT } from '../../../types/bff.type';

class ProductTerminate extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  /**
   * @param prodInfo
   * @private
   */
  private _parseProdInfo(prodInfo): any {
    return Object.assign(prodInfo, {
      reqProdInfo: Object.assign(prodInfo.reqProdInfo, {
        prodAmt: isNaN(parseInt(prodInfo.reqProdInfo.prodAmt, 10)) ? prodInfo.reqProdInfo.prodAmt
            : FormatHelper.addComma(prodInfo.reqProdInfo.prodAmt) + UNIT['110']
      })
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0017, {}, {}, this._prodId),
      this.redisService.getData('ProductChangeApi:' + this._prodId + 'TM')
    ).subscribe(([ prodInfo, terminateRedisInfo ]) => {
      if (prodInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: prodInfo.code,
          msg: prodInfo.msg,
          svcInfo: svcInfo
        });
      }

      if (FormatHelper.isEmpty(terminateRedisInfo)) {
        return this.error.render(res, {
          svcInfo: svcInfo
        });
      }

      res.render('product.terminate.html', {
        prodId: this._prodId,
        svcInfo: svcInfo,
        prodInfo: this._parseProdInfo(prodInfo.result),
        terminateApiCode: terminateRedisInfo.bffApiCode
      });
    });
  }
}

export default ProductTerminate;
