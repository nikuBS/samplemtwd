/*
 * @file membership.benefit.movieculture.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.30
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

    res.render('benefit/membership.benefit.movieculture.html', options);
  }
}

export default MembershipBenefitMovieculture;
