/**
 * FileName: recharge.ting.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.06.29
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';

class RechargeTing extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('ting/recharge.ting.html', { svcInfo: svcInfo });
  }
}

export default RechargeTing;
