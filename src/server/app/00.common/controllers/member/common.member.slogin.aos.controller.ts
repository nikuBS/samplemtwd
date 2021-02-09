/**
 * @file common.member.slogin.aos.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > AOS 간편로그인
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @desc AOS 간편로그인 class
 */
class CommonMemberSloginAos extends TwViewController {
  constructor() {
    super();
  }

  /**
   * AOS 간편로그인 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res:
    Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const mdnQuery = req.query.mdn;
    const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';

    if ( FormatHelper.isEmpty(mdnQuery) ) {
      res.render('member/common.member.slogin.aos.html', { svcInfo, pageInfo, mdn: null, target });
      // res.redirect('/common/member/slogin/fail');
    } else {
      const mdn = {
        original: mdnQuery,
        show: FormatHelper.conTelFormatWithDash(mdnQuery)
      };

      res.render('member/common.member.slogin.aos.html', { svcInfo, pageInfo, mdn, target });
    }
  }
}

export default CommonMemberSloginAos;
