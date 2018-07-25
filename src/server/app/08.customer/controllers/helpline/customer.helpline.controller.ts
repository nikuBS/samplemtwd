/*
 * FileName: customer.helpline.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from "../../../../common/controllers/tw.view.controller";
import { Request, Response, NextFunction } from "express";

export default class CustomerHelpline extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('helpline/customer.helpline.html', { svcInfo });
  }
}