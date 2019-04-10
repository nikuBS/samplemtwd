/**
 * @file commmon.line.cop-register.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.28
 * @desc 공통 > 회선등록 > 회선편집 > 법인회선등록
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 법인회선 등록 초기화를 위한 class
 */
class CommonMemberLineBizRegister extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 법인회선등록 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.line.biz-register.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberLineBizRegister;
