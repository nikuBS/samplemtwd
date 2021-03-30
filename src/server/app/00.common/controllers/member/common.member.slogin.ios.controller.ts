/**
 * @file common.member.slogin.ios.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > IOS 간편로그인
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @desc 공통 - IOS 간편로그인 class
 */
class CommonMemberSloginIos extends TwViewController {
  constructor() {
    super();
  }

  /**
   * IOS 간편로그인 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';
    res.render('member/common.member.slogin.ios.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberSloginIos;
