/**
 * @file myt-fare.bill.contents.prepay.controller.ts
 * @author 양정규
 * @since 2019.06.26
 * @desc 콘텐츠이용료 > 선결제 화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 * @desc 콘텐츠이용료 > 선결제 화면
 */
export default class MyTFareBillContentsPrepay extends TwViewController {
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
    res.render('billcontents/myt-fare.bill.contents.prepay.html', {
      svcInfo: svcInfo, // 회선 정보 (필수)
      pageInfo: pageInfo // 페이지 정보 (필수)
    });
  }
}
