/**
 * FileName: myt-fare.bill.small.history.detail.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTFareBillSmallHistoryDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    res.render('billsmall/myt-fare.bill.small.history.detail.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      data: {}
    });
  }
}

export default MyTFareBillSmallHistoryDetail;
