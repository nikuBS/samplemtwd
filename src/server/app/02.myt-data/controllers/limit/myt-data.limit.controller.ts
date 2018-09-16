/**
 * FileName: myt-data.limit.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MytDataLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('limit/myt-data.limit.html');
  }
}

export default MytDataLimit;
