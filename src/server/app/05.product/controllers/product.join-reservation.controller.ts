/**
 * FileName: product.join-reservation.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

class ProductJoinReservation extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  /**
   * @private
   */
  private _getProdBasicInfo(): Observable<any> {
    if (FormatHelper.isEmpty(this._prodId)) {
      return Observable.of({});
    }

    return this.apiService.request(API_CMD.BFF_10_0001, {}, {}, this._prodId);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._prodId = req.params.prodId || null;

    this._getProdBasicInfo().subscribe((basicInfo) => {
      if (!FormatHelper.isEmpty(this._prodId) && basicInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: basicInfo.code,
          msg: basicInfo.msg,
          svcInfo: svcInfo,
          title: '가입상담 예약'
        });
      }

      res.render('product.join-reservation.html', {
        prodId: this._prodId,
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        basicInfo: FormatHelper.isEmpty(this._prodId) ? null : basicInfo.result
      });
    });
  }
}

export default ProductJoinReservation;
