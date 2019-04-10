/**
 * 이용안내 > 이용자피해예방센터 > 이용자 피해예방 관련 사이트
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-24
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_PROTECT_RELATE_ORG, CUSTOMER_PROTECT_REPORT_ORG } from '../../../../types/outlink.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';

/**
 * @class
 */
class CustomerDamageInfoRelated extends TwViewController {
  constructor() {
    super();
  }

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
    res.render('damage-info/customer.damage-info.related.html', {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo, // 페이지 정보
      outlinkReport: CUSTOMER_PROTECT_REPORT_ORG, // 관련 사이트 - 상담/신고기관
      outlinkRelate: CUSTOMER_PROTECT_RELATE_ORG  // 관련 사이트 - 관련기관
    });
  }
}

export default CustomerDamageInfoRelated;
