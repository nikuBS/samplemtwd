/**
 * FileName: myt-data.familydata.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.16
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

export default class MyTDataFamilyHistory extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getHistory().subscribe(histories => {
      res.render('familydata/myt-data.familydata.history.html', { svcInfo, pageInfo, histories });
    });
  }

  private getHistory = () => {
    return this.apiService.request(API_CMD.BFF_06_0071, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const list = resp.result.mySharePot || [];
      return {
        total: list.reduce((total, history) => {
          return total + Number(history.shrPotGbQty);
        }, 0),
        list: list.map(history => {
          return {
            ...history,
            shrPotDonaAplyDt: DateHelper.getShortDate(history.shrPotDonaAplyDt)
          };
        })
      };
    });
  }
}
