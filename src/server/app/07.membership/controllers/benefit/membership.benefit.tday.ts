/*
 * FileName: membership.benefit.tday.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MembershipBenefitMovieculture extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const options: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    res.render('benefit/membership.benefit.tday.html', options);
  }
}

export default MembershipBenefitMovieculture;
