/**
 * FileName: common.member.slogin.ios.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonMemberSloginIos extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';
    res.render('member/common.member.slogin.ios.html', { svcInfo, pageInfo, target });
  }
}

export default CommonMemberSloginIos;
