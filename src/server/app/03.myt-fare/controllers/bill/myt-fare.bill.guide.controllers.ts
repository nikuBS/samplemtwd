/**
 * FileName: myt-fare.bill.guide.controller.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MytFareBillGuide extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render('/bill/myt-fare.bill.guide.html');
  }
}

export default MytFareBillGuide;
