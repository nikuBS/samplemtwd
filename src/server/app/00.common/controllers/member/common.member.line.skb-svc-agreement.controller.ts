/**
 * @file common.member.line.skb-svc-agreement.ts
 * @author Kangta Kim (kangta.kim@sktelecom.com)
 * @since 2019.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

/**
 * @desc 공통 - SK Broadband 서비스 이용 동의
 */
class CommonMemberLineSkbSvcAgreement extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // 서비스 이용 동의 페이지(1단계) 노출
    res.render('member/common.member.line.skb-svc-agreement.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberLineSkbSvcAgreement;
