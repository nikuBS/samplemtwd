import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';

class MyTUsageChange extends TwViewController {
  private apiService;

  constructor() {
    super();
    this.apiService = ApiService;
  }

  render(req: Request, res: Response, next: NextFunction) {
    const data = {};

    res.render('myt.usage.change.html', data);
  }
}

export default MyTUsageChange;
