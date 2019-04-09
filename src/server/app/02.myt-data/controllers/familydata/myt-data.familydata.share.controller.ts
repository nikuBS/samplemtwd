/**
 * @file myt-data.familydata.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

/**
 * @class
 * @desc T 가족모아 데이터 > 공유하기
 */
export default class MyTDataFamilyShare extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this._getMonthlyInfo().subscribe((monthly) => {
      if (monthly.code) {
        return this.error.render(res, {
          ...monthly,
          svcInfo: svcInfo,
          pageInfo
        });
      }

      res.render('familydata/myt-data.familydata.share.html', {
        svcInfo,
        pageInfo,
        monthly,
        isApp: BrowserHelper.isApp(req)
      });
    });
  }
  /**
   * @desc 자동 공유 설정 내용 가져오기
   * @private
   */
  private _getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0047, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      return resp.result;
    });
  }
}
