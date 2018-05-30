import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../../services/api.service';

class MyTUsage24hour50discount extends TwViewController {
  private apiService;

  constructor() {
    super();
    this.apiService = ApiService;
  }

  render(req: Request, res: Response, next: NextFunction) {
    const data = {};

    res.render('usage/myt.usage.24hour.50discount.html', data);
  }
}

export default MyTUsage24hour50discount;
