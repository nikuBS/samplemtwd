/**
 * 이용안내 > 공지사항
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../../types/string.type';
import { CUSTOMER_NOTICE_CTG_CD } from '../../../../types/bff.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import sanitizeHtml from 'sanitize-html';
import BrowserHelper from '../../../../utils/browser.helper';
import CommonHelper from '../../../../utils/common.helper';

/**
 * @class
 */
class CustomerSvcInfoNotice extends TwViewController {
  constructor() {
    super();
  }

  /* 카테고리 */
  private _category;
  /* 허용되는 카테고리 변수 값 */
  private _allowedCategoryList = ['tworld', 'directshop', 'membership', 'roaming'];
  /* 페이지 URL */
  private _baseUrl = '/customer/svc-info/notice';
  /* 각 카테고리 별 사용 API BFF No. */
  private _categoryApis = {
    tworld: API_CMD.BFF_08_0029,  // T world
    directshop: API_CMD.BFF_08_0039,  // T다이렉트
    membership: API_CMD.BFF_08_0031,  // T멤버쉽
    roaming: API_CMD.BFF_08_0040  // T로밍
  };

  /**
   * API 응답 값 변환
   * @param resultData - API 응답 값
   */
  private _convertData(resultData): any {
    return {
      list: this._convertListItem(resultData.content) // 게시물 목록 컨버팅
    };
  }

  /**
   * 공지사항 게시물 값 변환
   * @param content - 게시물 데이터
   */
  private _convertListItem(content) {
    return content.map(item => {
      if (this._category === 'tworld') {  // T world 일때는 응답 변수값이 달라서 분기 처리
        return Object.assign(item, {
          title: item.ntcTitNm, // 제목
          date: DateHelper.getShortDateWithFormat(item.fstRgstDtm, 'YYYY.M.D.'),  // 날짜 포맷 처리
          type: FormatHelper.isEmpty(CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd]) ? '' : CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd], // 유형
          itemClass: (item.ntcTypCd === 'Y' ? 'impo ' : '') + (item.new ? 'new' : '') // 제목 중요 또는 신규 아이콘 처리
        });
      }

      return Object.assign(item, {
        date: DateHelper.getShortDateWithFormat(item.rgstDt, 'YYYY.M.D.'),  // 날짜 포맷 처리
        type: FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm, // 유형
        itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : ''), // 제목 중요 또는 신규 아이콘 처리
        content: sanitizeHtml(item.content) // 내용 값 Dirty HTML 방지
      });
    });
  }

  /**
   * API 요청시 파라미터 처리
   * @param page - 페이지
   * @param tworldChannel - 요청 채널값
   */
  private _getReqParams(page: any, tworldChannel: any): any {
    let params = {
      page: (page - 1) < 0 ? 0 : page - 1,
      size: 10
    };

    // T world 요청시에만 추가 파라미터가 필요하다.
    if (this._category === 'tworld') {
      params = Object.assign({
        expsChnlCd: tworldChannel
      }, params);
    }

    return params;
  }

  /**
   * T world 공지사항 목록 API 요청시 채널값 분기 처리
   * @param isAndroid - 안드로이드 여부
   * @param isIos - iPhone 여부
   */
  private _getTworldChannel(isAndroid, isIos): any {
    if (isAndroid) {  // 안드로이드 일때
      return 'A';
    }

    if (isIos) {  // IOS 일때
      return 'I';
    }

    // 모웹 일때
    return 'M';
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const page = req.query.page || 1, // 페이지
      ntcId = req.query.ntcId || null,  // 게시물 키
      renderCommonInfo = {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo, // 페이지 정보
      title: CUSTOMER_NOTICE_CATEGORY.TWORLD  // 페이지 제목
    };

    // 카테고리 파라미터 값 없을 경우 예외처리
    this._category = req.query.category || 'tworld';

    // 카테고리 값이 허용된 것이 아닐 경우 오류 페이지 노출
    if (this._allowedCategoryList.indexOf(this._category) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    // T world 카테고리 일때만 채널 값 계산
    const tworldChannel: any = this._category === 'tworld' ? this._getTworldChannel(BrowserHelper.isAndroid(req), BrowserHelper.isIos(req)) : null;

    // 공지사항 API 요청
    this.apiService.request(this._categoryApis[this._category], this._getReqParams(page, tworldChannel))
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) { // 오류 응답시 오류 페이지 노출
          return this.error.render(res, renderCommonInfo);
        }

        res.render('svc-info/customer.svc-info.notice.html', Object.assign(renderCommonInfo, {
          ntcId: ntcId, // 게시물 키
          category: this._category, // 카테고리 값
          categoryLabel: CUSTOMER_NOTICE_CATEGORY[this._category.toUpperCase()],  // 카테고리 값에 대한 텍스트
          data: this._convertData(data.result), // 목록 데이터
          paging: CommonHelper.getPaging(this._baseUrl, 10, 3, page, data.result.totalElements),  // 목록 페이징
          tworldChannel: tworldChannel  // T world 채널 정보 client에 전달
        }));
      });
  }
}

export default CustomerSvcInfoNotice;
