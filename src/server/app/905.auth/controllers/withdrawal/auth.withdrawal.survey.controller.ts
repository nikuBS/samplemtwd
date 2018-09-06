/**
 * FileName: auth.withdrawal.survey.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class AuthWithdrawlSurvey extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('withdrawal/auth.withdrawal.survey.html', { svcInfo: svcInfo });
  }
}

export default AuthWithdrawlSurvey;
