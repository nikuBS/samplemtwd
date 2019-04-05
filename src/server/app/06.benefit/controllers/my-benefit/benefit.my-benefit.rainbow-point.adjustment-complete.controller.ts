/**
 * @file benefit.my-benefit.rainbow-point.adjustment-complete.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class BenefitMyBenefitRainbowPointAdjustmentComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('my-benefit/benefit.my-benefit.rainbow-point.adjustment-complete.html', { pageInfo });
  }

}

export default BenefitMyBenefitRainbowPointAdjustmentComplete;
