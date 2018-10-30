/*
 * FileName: benefit.membership.partner.movieculture.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class BenefitMembershipPartnerMovieCulture extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const options: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    res.render('membership/benefit.membership.partner.movieculture.html', options);
  }
}

export default BenefitMembershipPartnerMovieCulture;
