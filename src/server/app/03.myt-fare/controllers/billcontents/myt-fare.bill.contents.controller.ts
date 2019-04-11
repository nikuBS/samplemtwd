/**
 * @file myt-fare.bill.contents.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.08
 * @desc 콘텐츠이용료 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 * @desc 콘텐츠이용료 메인
 */
class MyTFareBillContents extends TwViewController {
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
    res.render('billcontents/myt-fare.bill.contents.html', {
      svcInfo: svcInfo, // 회선 정보 (필수)
      pageInfo: pageInfo, // 페이지 정보 (필수)
      currentMonth: this.getCurrentMonth() // 현재월 조회
    });
  }

  /**
   * @function
   * @desc 현재월 조회
   * @returns {any}
   */
  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth();
  }
}

export default MyTFareBillContents;
