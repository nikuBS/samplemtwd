/**
 * @file common.member.line.empty.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.01
 * @desc 공통 > 회선관리 > 등록회선 없음
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @desc 공통 - 등록회선 없음 class
 */
class CommonMemberLineEmpty extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 등록회선 없음 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.line.empty.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberLineEmpty;
