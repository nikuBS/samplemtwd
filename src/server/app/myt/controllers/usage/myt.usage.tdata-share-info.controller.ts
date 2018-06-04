import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTUsageTDataShareInfo extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = {
      userName: svcInfo.custNm,
      url: {
        checkTDataShareInfo: '#',
        onLineQnA: '#',
        customerCenter: '#'
      },
    };

    res.render('usage/myt.usage.tdata-share-info.html', data);
  }
}

export default MyTUsageTDataShareInfo;
