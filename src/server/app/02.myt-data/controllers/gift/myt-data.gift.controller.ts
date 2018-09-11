/**
 * FileName: myt-data.gift.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.10
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MytDataGift extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('gift/myt-data.gift.html', { svcInfo: svcInfo });
  }
}

export default MytDataGift;
