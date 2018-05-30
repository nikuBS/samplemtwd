import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTUsageChildren extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    const data = {};

    res.render('usage/myt.usage.children.html', data);
  }
}

export default MyTUsageChildren;
