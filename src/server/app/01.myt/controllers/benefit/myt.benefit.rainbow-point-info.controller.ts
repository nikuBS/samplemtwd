/**
 * FileName: myt.benefit.rainbow-point-info.controller.ts.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTBenefitRainbowPointInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('benefit/myt.benefit.rainbow-point-info.html', { svcInfo: svcInfo });
  }
}

export default MyTBenefitRainbowPointInfo;
