import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTRefillHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refillrecharge/refill/refill.history.html', {});
  }
}

export default MyTRefillHistory;
