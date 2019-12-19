/**
 * @file common.member.line.skb-svc-agreement.ts
 * @author Kangta Kim (kangta.kim@sktelecom.com)
 * @since 2019.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import ProductHelper from '../../../../utils/product.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_JOIN_WIRE_SVCATTRCD, NODE_ERROR_MSG } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Request, Response, NextFunction, response } from 'express';
import { Observable } from 'rxjs';
import { request } from 'https';

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