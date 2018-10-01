/**
 * FileName: myt-fare.bill.hotbill.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 9. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTFareBillHotbill extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.renderView(res, 'bill/myt-fare.bill.hotbill.html', {
      svcInfo: svcInfo
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }
}
export default MyTFareBillHotbill;
