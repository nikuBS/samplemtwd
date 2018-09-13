/**
 * FileName: myt-data.usage.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MyTDataUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('usage/myt-data.usage.html', { svcInfo: svcInfo });
  }
}

export default MyTDataUsage;
