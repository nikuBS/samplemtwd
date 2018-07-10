import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';

class RechargeCookiz extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_06_0028, {}).subscribe((resp) => {
      const result = {
        code: '00',
        msg: 'success',
        result: {
          blockYn: 'Y',
          currentTopUpLimit: '15000',
          regularTopUpYn: 'Y',
          regularTopUpAmt: '5000'
        }
      };

      const isBlocked = false;

      if ( isBlocked ) {
        res.render('cookiz/recharge.cookiz.blocked.html', { svcInfo: svcInfo });
      } else {
        res.render('cookiz/recharge.cookiz.html', { svcInfo: svcInfo });
      }
    });
  }
}

export default RechargeCookiz;
