import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTUsageTRoamingShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    const data = {};

    res.render('usage/myt.usage.troaming-share.html', data);
  }
}

export default MyTUsageTRoamingShare;
