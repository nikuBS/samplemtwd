/**
 * FileName: myt.usage.tdata-share-close.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageTDataShareClose extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('usage/myt.usage.tdata-share-close.html', {
      cSvcMgmtNum: req.query.cSvcMgmtNum,
      closeDate: DateHelper.getShortDateNoDot(new Date()),
      svcInfo
    });
  }
}

export default MyTUsageTDataShareClose;
