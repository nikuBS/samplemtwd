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
   * [OP002-10318] [FE][보안진단] Android 간편로그인 개선 요청 - SMS 인증 추가 필요 건으로 AOS, IOS 통합 처리
   * AOS, IOS 간편로그인 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // app 에서 query target 에 query 포함 전체 url이 넘어오는 이슈로 인해 예외처리 추가
    const chkTarget = 'target=';
    let target = decodeURIComponent(req.query.target || '');
    const targetIndex = target.indexOf(chkTarget);
    if (targetIndex > -1) {
      target = target.substring(targetIndex + chkTarget.length, target.length);
    }
    // const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';
    res.render('member/common.member.slogin.ios.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberSloginIos;
