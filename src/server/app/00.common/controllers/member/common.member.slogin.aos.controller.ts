/**
 * @file common.member.slogin.aos.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > AOS 간편로그인
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import CommonMemberSloginIos from './common.member.slogin.ios.controller';

/**
 * @desc AOS 간편로그인 class
 */
class CommonMemberSloginAos extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param child
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    /**
     * 특정페이지 환경에 맞춰서 페이지 오픈 정보처리하기 위한 방법
     */
    this.getAdvancementPageVisibleCheck({ menuId: pageInfo.menuId, host: req.hostname })
      .subscribe((advancement) => {
        if ( advancement ) {
          // local 테스트틀 하기 위해 추가
          if ( (process.env.NODE_ENV === advancement.env && advancement.visible)
            || process.env.NODE_ENV === 'local' ) {
            new CommonMemberSloginIos().initPage(req, res, next);
            return false;
          }
        }
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
      }, (error) => {
        throw error;
      });
  }
}

export default CommonMemberSloginAos;
