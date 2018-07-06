import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class RechargeLimitProcess extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('limit/recharge.limit.process.html', { svcInfo });
  }
}
