/**
 * @file myt-fare.bill.contents.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.08
 * @desc 콘텐츠이용료 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

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
    res.redirect('/myt-fare/bill/small');
    /*Observable.combineLatest(
      this.getUnusualStatus()
    ).subscribe(([unusualStatus]) => {
      res.render('billcontents/myt-fare.bill.contents.html', {
        svcInfo: svcInfo, // 회선 정보 (필수)
        pageInfo: pageInfo, // 페이지 정보 (필수)
        unusualYn: unusualStatus, // 특이고객 여부
        currentMonth: this.getCurrentMonth() // 현재월 조회
      });
    });*/
  }

  /**
   * @function
   * @desc 현재월 조회
   * @returns {any}
   */
  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth();
  }

  /**
   * @desc 특이고객 유/무
   * @returns Observable<any>
   */
  private getUnusualStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0103, {}).map( resp => {
      return (resp.code === API_CODE.CODE_00 && resp.result.spcl_sp_yn === 'Y') ? 'Y' : 'N';
    });
  }
}

export default MyTFareBillContents;
