/*
 * FileName: recharge.limit.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

import { NextFunction, Request, Response } from "express";
import TwViewController from "../../../../common/controllers/tw.view.controller";

export default class RechargeLimitHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('limit/recharge.limit.history.html', { svcInfo });
  }
}
