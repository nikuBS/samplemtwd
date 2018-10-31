/**
 * FileName: product.join-reservation.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { PRODUCT_RESERVATION_TYPE_NM, PRODUCT_RESERVATION_COMBINE_NM } from '../../../types/string.type';
import FormatHelper from '../../../utils/format.helper';

class ProductJoinReservation extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const typeCd = req.query.type_cd || null,
      prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(typeCd) || FormatHelper.isEmpty(PRODUCT_RESERVATION_TYPE_NM[typeCd])) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        title: '가입 상담 예약'
      });
    }

    let prodNm: any = PRODUCT_RESERVATION_COMBINE_NM.NONE;

    if (!FormatHelper.isEmpty(prodId)) {
      prodNm = FormatHelper.isEmpty(PRODUCT_RESERVATION_COMBINE_NM[prodId]) ?
          PRODUCT_RESERVATION_COMBINE_NM.ETC : PRODUCT_RESERVATION_COMBINE_NM[prodId];
    }

    res.render('product.join-reservation.html', {
      typeCd: typeCd,
      typeName: PRODUCT_RESERVATION_TYPE_NM[typeCd],
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId,
      prodNm: prodNm
    });
  }
}

export default ProductJoinReservation;
