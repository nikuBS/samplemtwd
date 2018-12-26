/**
 * 인터넷/전화/TV > 가입 상담/예약
 * FileName: product.wireplan.join-reservation.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { PRODUCT_RESERVATION_TYPE_NM, PRODUCT_RESERVATION_COMBINE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

class ProductWireplanJoinReservation extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param allSvc
   * @private
   */
  private _convertIsProductInfo (allSvc: any): any {
    const svcAttrCdM = FormatHelper.isEmpty(allSvc.m) ? [] : allSvc.m,
      svcAttrCdS = FormatHelper.isEmpty(allSvc.s) ? [] : allSvc.s,
      svcAttrList = this._getSvcAttrList([...svcAttrCdM, ...svcAttrCdS]);

    return {
      cellphone: svcAttrList.indexOf('M1') !== -1,
      internet: svcAttrList.indexOf('S1') !== -1,
      tv: svcAttrList.indexOf('S2') !== -1,
      phone: svcAttrList.indexOf('S3') !== -1
    };
  }

  /**
   * @param svcList
   * @private
   */
  private _getSvcAttrList (svcList: any): any {
    return svcList.map((item) => {
      return item.svcAttrCd;
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const typeCd = req.query.type_cd || 'internet',
      prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(typeCd) || FormatHelper.isEmpty(PRODUCT_RESERVATION_TYPE_NM[typeCd])) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        title: PRODUCT_RESERVATION_TYPE_NM.title
      });
    }

    let prodNm: any = PRODUCT_RESERVATION_COMBINE_NM.NONE;

    if (!FormatHelper.isEmpty(prodId)) {
      prodNm = FormatHelper.isEmpty(PRODUCT_RESERVATION_COMBINE_NM[prodId]) ?
          PRODUCT_RESERVATION_COMBINE_NM.ETC : PRODUCT_RESERVATION_COMBINE_NM[prodId];
    }

    const isProductInfo: any = FormatHelper.isEmpty(allSvc) ? {} : this._convertIsProductInfo(allSvc);

    res.render('wireplan/join/product.wireplan.join.reservation.html', {
      isProduct: isProductInfo,
      typeCd: typeCd,
      typeName: PRODUCT_RESERVATION_TYPE_NM[typeCd],
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId,
      prodNm: prodNm
    });
  }
}

export default ProductWireplanJoinReservation;
