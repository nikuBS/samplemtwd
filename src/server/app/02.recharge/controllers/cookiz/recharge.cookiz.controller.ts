import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';

class RechargeCookiz extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('cookiz/recharge.cookiz.html', { svcInfo: svcInfo });
    // return this.apiService.request(API_CMD.BFF_03_0003_C, { svcCtg: 'M' })
    //   .subscribe((response) => {
    //     res.render('gift/recharge.gift.html', { lineList: response.result, svcInfo: svcInfo });
    //   });
  }
}

export default RechargeCookiz;
