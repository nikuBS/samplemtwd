/**
 * 예약 취소 - 유선 부가서비스
 * FileName: product.wireplan.reservation-cancel.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';

class ProductWireplanReservationCancel extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '04' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0166, { joinTermCd: '04' }, {}, [prodId])
    ).subscribe(([joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('wireplan/product.wireplan.reservation-cancel', Object.assign(renderCommonInfo, {
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, false),
        currentAdditionsInfo: currentAdditionsInfo.result
      }));
    });
  }
}

export default ProductWireplanReservationCancel;
