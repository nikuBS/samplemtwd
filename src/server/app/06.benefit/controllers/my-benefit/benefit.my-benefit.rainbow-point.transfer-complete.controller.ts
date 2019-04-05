/**
 * FileName: benefit.my-benefit.rainbow-point.transfer-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class BenefitMyBenefitRainbowPointTransferComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('my-benefit/benefit.my-benefit.rainbow-point.transfer-complete.html', { pageInfo });
  }

}

export default BenefitMyBenefitRainbowPointTransferComplete;
