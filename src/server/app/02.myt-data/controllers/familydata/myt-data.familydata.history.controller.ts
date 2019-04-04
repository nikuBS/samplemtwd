/**
 * FileName: myt-data.familydata.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.16
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { of } from 'rxjs/observable/of';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

export default class MyTDataFamilyHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.getShareAmount(svcInfo, req.query.amount), this.getHistory()).subscribe(([total, histories]) => {
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

  private getShareAmount(svcInfo, amount) {
    if (amount) {
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

  private getHistory = () => {
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
