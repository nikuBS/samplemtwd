/**
 * FileName: myt-fare.bill.set.return-history.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MyTFareBillSetReturnHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    res.render('bill/myt-fare.bill.set.return-history.html', {svcInfo, pageInfo});
  }
}

export default MyTFareBillSetReturnHistory;
