/**
 * FileName: myt-fare.bill.contents.history.detail.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTFareBillContentsHistoryDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('billcontents/myt-fare.bill.contents.history.detail.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      data: {}
    });
  }
}

export default MyTFareBillContentsHistoryDetail;
