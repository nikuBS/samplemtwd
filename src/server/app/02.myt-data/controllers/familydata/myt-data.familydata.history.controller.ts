/**
 * @file 이번 달 공유내역 < T가족모아 데이터 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @since 2019.01.16
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { of } from 'rxjs/observable/of';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

/**
 * @class
 * @desc T 가족모아 > 이번달 공유 내역
 */
export default class MyTDataFamilyHistory extends TwViewController {
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
    Observable.combineLatest(this._getShareAmount(svcInfo, req.query.amount), this._getHistory()).subscribe(([total, histories]) => {
      const error = {
        code: total.code || histories.code,
        msg: total.msg || histories.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      res.render('familydata/myt-data.familydata.history.html', { svcInfo, pageInfo, histories, total });
    });
  }

  /**
   * @desc 이번달 총 공유 양 가져오기
   * @param svcInfo server input
   * @param amount 이번 달 공유 양
   * @private
   */
  private _getShareAmount(svcInfo, amount) {
    if (amount) { // 총양이 넘어온 경우, api 요청 필요 없음
      return of(amount);
    }

    return this.apiService.request(API_CMD.BFF_06_0044, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const mine = resp.result.mbrList.find(member => member.svcMgmtNum === svcInfo.svcMgmtNum);
      return FormatHelper.addComma(mine.shared) || '0';
    });
  }

  /**
   * @desc 이번달 공유 내역 가져오기
   * @private
   */
  private _getHistory = () => {
    return this.apiService.request(API_CMD.BFF_06_0071, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const list = resp.result.mySharePot || [];
      return list.map(history => {
        return {
          ...history,
          shrPotDonaAplyDt: DateHelper.getShortDate(history.shrPotDonaAplyDt)
        };
      });
    });
  }
}
