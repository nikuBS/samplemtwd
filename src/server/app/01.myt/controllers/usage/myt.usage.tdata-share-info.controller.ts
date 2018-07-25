/**
 * FileName: myt.usage.tdata-share-info.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
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
        checkTDataShareInfo: '?',
        onLineQnA: '?',
        customerCenter: '?'
      },
      svcInfo
    };

    res.render('usage/myt.usage.tdata-share-info.html', data);
  }
}

export default MyTUsageTDataShareInfo;
