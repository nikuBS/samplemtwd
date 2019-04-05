/**
 * FileName: membership.benefit.plus.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MembershipBenefitPlus extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('benefit/membership.benefit.plus.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default MembershipBenefitPlus;
