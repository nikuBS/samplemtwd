/**
 * FileName: customer.protect.guide-view.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';
import FormatHelper from '../../../../utils/format.helper';

class CustomerProtectGuideView extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const idx = req.query.idx || '';

    if (FormatHelper.isEmpty(idx) || FormatHelper.isEmpty(CUSTOMER_PROTECT_GUIDE_WEBTOON[idx])) {
      return res.redirect('/customer/damage_info/cmis_0003');
    }

    res.render('protect/customer.protect.guide-view.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: CUSTOMER_PROTECT_GUIDE_WEBTOON[idx]
    });
  }
}

export default CustomerProtectGuideView;
