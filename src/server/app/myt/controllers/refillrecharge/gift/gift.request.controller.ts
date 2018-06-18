import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTGiftRequestProcess extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('refillrecharge/gift/gift.request.process.html', { svcInfo: svcInfo });
  }
}

export default MyTGiftRequestProcess;
