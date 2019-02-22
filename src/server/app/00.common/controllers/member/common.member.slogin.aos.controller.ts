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
    const query = req.query;
    if ( FormatHelper.isEmpty(query) ) {
      res.redirect('/common/member/slogin/fail');
    }
    const mdn = {
      original: query.mdn,
      show: FormatHelper.conTelFormatWithDash(query.mdn)
    };

    res.render('member/common.member.slogin.aos.html', { svcInfo, pageInfo, mdn });
  }
}

export default CommonMemberSloginAos;
