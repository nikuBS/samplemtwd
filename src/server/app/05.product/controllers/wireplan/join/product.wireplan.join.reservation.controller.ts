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
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';

class ProductWireplanJoinReservation extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 상품 카테고리별 회선 보유 여부 확인
   * @param allSvc
   * @private
   */
  private _convertIsProductInfo (allSvc: any): any {
    const svcAttrCdM = FormatHelper.isEmpty(allSvc.m) ? [] : allSvc.m,  // 무선 회선 목록
      svcAttrCdS = FormatHelper.isEmpty(allSvc.s) ? [] : allSvc.s,  // 유선 회선 목록
      svcAttrList = this._getSvcAttrList([...svcAttrCdM, ...svcAttrCdS]); // 회선 목록에서 회선 카테고리 값 추출

    return {
      cellphone: svcAttrList.indexOf('M1') !== -1,  // 핸드폰
      internet: svcAttrList.indexOf('S1') !== -1, // 인터넷
      tv: svcAttrList.indexOf('S2') !== -1, // TV
      phone: svcAttrList.indexOf('S3') !== -1 // 집전화
    };
  }

  /**
   * 회선 목록에서 회선 카테고리 값 추출
   * @param svcList
   * @private
   */
  private _getSvcAttrList (svcList: any): any {
    return svcList.map((item) => {
      return item.svcAttrCd;  // 회선 카테고리 값
    });
  }

  /**
   * 예약상담 심사내역 조회하여 화면 상단 제출/조회 영역 노출 하기 위한 처리
   * @param requireDocumentInfo
   * @private
   */
  private _convertRequireDocument (requireDocumentInfo: any) {
    // API 응답 코드가 정상이 아니거나 심사내역이 빈값일 경우 null 리턴
    if (requireDocumentInfo.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(requireDocumentInfo.result.necessaryDocumentInspectInfoList)) {
      return null;
    }

    // 마지막 심사내역 기준으로 데이터 처리함
    const latestItem = requireDocumentInfo.result.necessaryDocumentInspectInfoList[0];

    // CIA 심사상태가 빈값 이거나, 값이 정상 또는 비정상이 아닐때_ 조회 노출
    if (FormatHelper.isEmpty(latestItem.ciaInsptRslt) ||
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.NORMAL &&
      latestItem.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.ABNORMAL) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    // CIA 심사상태가 비정상 & 비정상 사유 코드가 존재할때 _ 제출 노출
    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && !FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.APPLY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.APPLY,
        page: 'apply'
      };
    }

    // CIA 심사상태가 비정상 & 비정상 사유 코드가 존재하지 않을때 _ 조회 노출
    if (latestItem.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL && FormatHelper.isEmpty(latestItem.ciaInsptRsnCd)) {
      return {
        text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
        btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
        page: 'history'
      };
    }

    // 그외 _ 조회 노출
    return {
      text: PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT.HISTORY,
      btnText: PRODUCT_REQUIRE_DOCUMENT.HISTORY,
      page: 'history'
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const typeCd = req.query.type_cd || 'internet', // 상품 카테고리
      prodId = req.query.prod_id || null, // 상품코드
      renderCommonInfo = {
        svcInfo: svcInfo, // 사용자 정보
        pageInfo: pageInfo, // 페이지 정보
        title: PRODUCT_RESERVATION_TYPE_NM.title  // 제목
      };

    // 잘못된 상품 카테고리가 전달 되었을 경우 오류 처리
    if (FormatHelper.isEmpty(PRODUCT_RESERVATION_TYPE_NM[typeCd])) {
      return this.error.render(res, renderCommonInfo);
    }

    // 상품명 (Default)
    let prodNm: any = PRODUCT_RESERVATION_COMBINE_NM.NONE;

    // 상품코드가 있을 때 상품명 초기화, 코드 있으나 정의된 것 없으면 그외 결합 상품
    if (!FormatHelper.isEmpty(prodId)) {
      prodNm = FormatHelper.isEmpty(PRODUCT_RESERVATION_COMBINE_NM[prodId]) ?
          PRODUCT_RESERVATION_COMBINE_NM.ETC : PRODUCT_RESERVATION_COMBINE_NM[prodId];
    }

    // 상품 카테고리별 회선 보유 여부 확인
    const isProductInfo: any = FormatHelper.isEmpty(allSvc) ? {} : this._convertIsProductInfo(allSvc);

    this.apiService.request(API_CMD.BFF_10_0078, {})
      .subscribe((combineRequireDocumentInfo) => {
        res.render('wireplan/join/product.wireplan.join.reservation.html', {
          combineRequireDocumentInfo: this._convertRequireDocument(combineRequireDocumentInfo), // 심사내역 데이터 컨버팅
          isProduct: isProductInfo, // 상품 카테고리별 회선 보유 여부 확인
          typeCd: typeCd,  // 상품 카테고리 정보
          typeName: PRODUCT_RESERVATION_TYPE_NM[typeCd],  // 상품 카테고리 명
          svcInfo: svcInfo, // 사용자 정보
          pageInfo: pageInfo, // 페이지 정보
          prodId: prodId, // 상품 코드
          prodNm: prodNm  // 상품 명
        });
      });
  }
}

export default ProductWireplanJoinReservation;
