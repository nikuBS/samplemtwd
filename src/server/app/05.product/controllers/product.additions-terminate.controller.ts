/**
 * FileName: product.additions-terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { UNIT } from '../../../types/bff.type';
import product_BFF_10_0017 from '../../../mock/server/product.additions-terminate.mock';
import {Observable} from 'rxjs/Observable';

class ProductAdditionsTerminate extends TwViewController {
  constructor() {
    super();
  }

  private _getApi(): Observable<any> {
    return Observable.of(product_BFF_10_0017);
    // return this.apiService.request(API_CMD.BFF_10_0017, {
    //   joinTermCd: '03'
    // });
  }

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
    const prodId = req.params.prodId;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this._getApi(),
      this.redisService.getData(prodId + 'TERM')
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

      res.render('product.additions-terminate.html', {
        prodId: prodId,
        svcInfo: svcInfo,
        prodInfo: this._parseProdInfo(prodInfo.result),
        terminateApiCode: terminateRedisInfo.apiCode
      });
    });
  }
}

export default ProductAdditionsTerminate;
