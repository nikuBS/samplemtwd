/**
 * 공지사항 > 상세 (T world Only)
 * FileName: customer.svc-info.notice.view.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../../types/string.type';
import { CUSTOMER_NOTICE_CTG_CD } from '../../../../types/bff.type';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import sanitizeHtml from 'sanitize-html';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerSvcInfoNoticeView extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 게시물 값 변환
   * @param resultData
   * @private
   */
  private _convertData(resultData): any {
    return Object.assign(resultData, {
      date: DateHelper.getShortDateWithFormat(resultData.fstRgstDtm, 'YYYY.M.DD'),  // 날짜 포맷
      type: FormatHelper.isEmpty(CUSTOMER_NOTICE_CTG_CD[resultData.ntcCtgCd]) ? '' : CUSTOMER_NOTICE_CTG_CD[resultData.ntcCtgCd], // 게시물 유형
      content: sanitizeHtml(resultData.ntcCtt)  // Dirty Html 방지
    });
  }

  /**
   * T world 채널 값 처리
   * @param isAndroid
   * @param isIos
   * @private
   */
  private _getChannel(isAndroid, isIos): any {
    if (isAndroid) {  // 안드로이드 일떄
      return 'A';
    }

    if (isIos) {  // IOS 일떄
      return 'I';
    }

    // 모웹 일때
    return 'M';
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const ntcId = req.query.ntcId || null,  // 게시물 키
      renderCommonInfo = {
        svcInfo: svcInfo, // 사용자 정보
        pageInfo: pageInfo, // 페이지 정보
        title: CUSTOMER_NOTICE_CATEGORY.VIEW  // 페이지 제목
      };

    // 게시물 키 값 없을시 오류 처리
    if (FormatHelper.isEmpty(ntcId)) {
      return this.error.render(res, renderCommonInfo);
    }

    // 공지사항 게시물 내용 조회 API 요청
    this.apiService.request(API_CMD.BFF_08_0029, {
      expsChnlCd: this._getChannel(BrowserHelper.isAndroid(req), BrowserHelper.isIos(req)), // T world 채널 설정
      ntcId: ntcId  // 게시물 키
    }).subscribe((data) => {
      if (data.code !== API_CODE.CODE_00) { // 오류 응답시 처리
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: data.code,
          msg: data.msg
        }));
      }

      res.render('svc-info/customer.svc-info.notice.view.html', Object.assign(renderCommonInfo, {
        ntcId: ntcId, // 게시물 키
        data: this._convertData(data.result)  // 게시물 데이터
      }));
    });
  }
}

export default CustomerSvcInfoNoticeView;
