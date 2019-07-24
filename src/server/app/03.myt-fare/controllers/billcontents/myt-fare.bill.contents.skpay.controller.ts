/**
 * @file myt-fare.bill.contents.skpay.controller.ts
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.07.24
 * @desc 콘텐츠이용료 > SK pay 선결제 화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

/**
 * @class
 * @desc 콘텐츠이용료 > SK pay 선결제 화면
 */
export default class MyTFareBillContentsSKpay extends TwViewController {
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
    res.render('billcontents/myt-fare.bill.contents.skpay.html', {
      svcInfo: svcInfo, // 회선 정보 (필수)
      pageInfo: pageInfo, // 페이지 정보 (필수)
      skpayInfo : _skpayInfo
    });
  }
}
