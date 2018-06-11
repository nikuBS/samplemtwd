import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import LineService from '../../../../../services/line.service';

class MyTGift extends TwViewController {
  public lineService = new LineService();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.lineService.getMobileLineList()
      .subscribe((response) => {
        res.render('refillrecharge/gift/gift.html', { lineList: response.result, svcInfo: svcInfo });
      });
  }
}

export default MyTGift;
