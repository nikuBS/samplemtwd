import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';

class RechargeGift extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    return this.apiService.request(API_CMD.BFF_03_0003, { svcCtg: 'M' })
      .subscribe((response) => {
        res.render('gift/gift.html', { lineList: response.result, svcInfo: svcInfo });
      });
  }
}

export default RechargeGift;
