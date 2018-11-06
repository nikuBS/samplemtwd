/**
 * FileName: membership.benefit.brand-benefit.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MembershipBenefitBrandBenefit extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    res.render('benefit/membership.benefit.brand-benefit.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default MembershipBenefitBrandBenefit;
