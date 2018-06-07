import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';

class MyTUsageChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_03_0002, {})
      .subscribe((response) => {
        res.render('usage/myt.usage.change.html', { result: response.result, svcInfo: svcInfo });
      });
  }
}

export default MyTUsageChange;
