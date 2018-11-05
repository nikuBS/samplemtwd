/**
 * FileName: common.landing.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.05
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CommonLanding extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const url = decodeURIComponent(req.query.url);
    res.json(url);
  }
}

export default CommonLanding;