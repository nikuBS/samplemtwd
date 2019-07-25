/**
 * @file myt-fare.bill.small.skpay.controller.ts
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.07.24
 * @desc 소액결제 > SK pay 선결제 화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

/**
 * @class
 * @desc 소액결제 > SK pay 선결제 화면
 */
class MyTFareBillSmallSKpay extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    var https = 'https';
    if(req.headers.host === 'localhost:3000'){
      https = 'http';
    }
    var _skpayInfo = {
      redirectUri : https + '://' + req.headers.host + '/myt-fare/bill/skpay/result/prepay',
      svcMgmtNum : svcInfo.svcMgmtNum
    }
    res.render('billsmall/myt-fare.bill.small.skpay.html', {
      pageInfo,
      svcInfo,
      skpayInfo : _skpayInfo
    });
  }
}

export default MyTFareBillSmallSKpay;
