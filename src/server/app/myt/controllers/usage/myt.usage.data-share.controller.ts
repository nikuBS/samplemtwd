import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageDataShare extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    const data = {
      remainDate : DateHelper.getRemainDate()
    };

    res.render('usage/myt.usage.data-share.html', data);
  }
}

export default MyTUsageDataShare;
