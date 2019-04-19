/**
 * 이용안내 > 이용자피해예방센터 > 콘텐츠 페이지
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-30
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_DAMAGEINFO_CONTENTS_TITLE } from '../../../../types/string.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 */
class CustomerDamageInfoContents extends TwViewController {
  constructor() {
    super();
  }

  /* 콘텐츠 페이지 PathVariable 허용 */
  private readonly _allowedPageNo = ['page001', 'page002', 'page003', 'page004', 'page005', 'page006', 'page007',
    'page008', 'page009', 'page010', 'page011', 'page012', 'page013', 'page014', 'page015', 'page016', 'page017', 'page018'];

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const pageNo = req.params.pageNo,
      renderCommonInfo = {
        pageNo: pageNo, // 페이지 번호
        svcInfo: svcInfo, // 사용자 정보
        pageInfo: pageInfo  // 페이지 정보
      };

    // 허용된 페이지 번호가 아닐 경우
    if (this._allowedPageNo.indexOf(pageNo) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    res.render('damage-info/contents/customer.damage-info.contents.html', Object.assign(renderCommonInfo, {
      pageTitle: CUSTOMER_DAMAGEINFO_CONTENTS_TITLE[pageNo], // 페이지 번호에 맞는 타이틀 값 연결
      isApp: BrowserHelper.isApp(req)
    }));
  }
}

export default CustomerDamageInfoContents;
