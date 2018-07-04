import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';

class RechargeTingProcess extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('ting/recharge.ting.process.html', { svcInfo: svcInfo });
  }
}

export default RechargeTingProcess;
