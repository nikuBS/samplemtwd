/**
 * @file myt-fare.bill.skpay.agree.controller.ts
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 * @desc 제3자 동의 page
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 제3자 동의 화면
 */
class MyTFareBillSkpayAgree extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    res.render('bill/myt-fare.bill.skpay.agree.html', { data });
  }
}


export default MyTFareBillSkpayAgree;
