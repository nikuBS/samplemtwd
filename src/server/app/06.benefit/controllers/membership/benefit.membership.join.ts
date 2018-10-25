/*
 * FileName: benefit.membership.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.25
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class BenefitMembershipJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };
    // TODO: 피처폰, 법인 폰 구분하여 분기 처리 필요함
    // Feature phone
    // data.type = 'feature';
    // data.isFeature = true;
    // Corporate
    // data.type = 'corporate';

    res.render('membership/benefit.membership.join.html', { data });
  }
}

export default BenefitMembershipJoin;
