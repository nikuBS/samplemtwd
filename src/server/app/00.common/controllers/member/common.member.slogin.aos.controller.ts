/**
 * FileName: common.member.slogin.aos.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonMemberSloginAos extends TwViewController {
  constructor() {
    super();
  }

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
