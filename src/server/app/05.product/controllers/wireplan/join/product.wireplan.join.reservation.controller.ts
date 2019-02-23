/**
 * 인터넷/전화/TV > 가입 상담/예약
 * FileName: product.wireplan.join-reservation.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {
  PRODUCT_RESERVATION_TYPE_NM,
  PRODUCT_RESERVATION_COMBINE_NM,
  PRODUCT_REQUIRE_DOCUMENT,
  PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT
} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';

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

  /**
   * @param requireDocumentInfo
   * @private
   */
  private _convertRequireDocument (requireDocumentInfo: any) {
    if (requireDocumentInfo.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(requireDocumentInfo.result.necessaryDocumentInspectInfoList)) {
      return null;
    }

    const latestItem = requireDocumentInfo.result.necessaryDocumentInspectInfoList[0];

    if (FormatHelper.isEmpty(latestItem.ciaInsptRslt) ||
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.NORMAL &&
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.ABNORMAL) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && !FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.APPLY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.APPLY,
        page: 'apply'
      };
    }

    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    return {
      text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
      btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
      page: 'history'
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const typeCd = req.query.type_cd || 'internet',
      prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(typeCd) || FormatHelper.isEmpty(PRODUCT_RESERVATION_TYPE_NM[typeCd])) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_RESERVATION_TYPE_NM.title
      });
    }

    let prodNm: any = PRODUCT_RESERVATION_COMBINE_NM.NONE;

    if (!FormatHelper.isEmpty(prodId)) {
      prodNm = FormatHelper.isEmpty(PRODUCT_RESERVATION_COMBINE_NM[prodId]) ?
          PRODUCT_RESERVATION_COMBINE_NM.ETC : PRODUCT_RESERVATION_COMBINE_NM[prodId];
    }

    const isProductInfo: any = FormatHelper.isEmpty(allSvc) ? {} : this._convertIsProductInfo(allSvc);

    this.apiService.request(API_CMD.BFF_10_0078, {})
      .subscribe((combineRequireDocumentInfo) => {
        res.render('wireplan/join/product.wireplan.join.reservation.html', {
          combineRequireDocumentInfo: this._convertRequireDocument(combineRequireDocumentInfo),
          isProduct: isProductInfo,
          typeCd: typeCd,
          typeName: PRODUCT_RESERVATION_TYPE_NM[typeCd],
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          prodId: prodId,
          prodNm: prodNm
        });
      });
  }
}

export default ProductWireplanJoinReservation;
