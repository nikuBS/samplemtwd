/**
 * FileName: myt-data.familydata.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';

export default class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.getFamilyData(svcInfo), this.getHistory()).subscribe(([familyInfo, histories]) => {
      // this.getFamilyData(svcInfo).subscribe(familyInfo => {
      const error = {
        code: familyInfo.code || histories.code,
        msg: familyInfo.msg || histories.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          pageInfo,
          svcInfo
        });
      }

      res.render('familydata/myt-data.familydata.html', { svcInfo, pageInfo, familyInfo, histories });
    });
  }

  private getFamilyData = svcInfo => {
    return this.apiService.request(API_CMD.BFF_06_0044, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      const representation = resp.result.mbrList.find(member => member.repYn === 'Y');
      const mine = resp.result.mbrList.find(member => member.svcMgmtNum === svcInfo.svcMgmtNum);

      if (!mine) {
        return {
          code: '',
          msg: ''
        };
      }

      const limit = Number(mine.limitation),
        data =
          mine.limitedYn === 'Y'
            ? {
                remained: limit === 0 ? 0 : Math.min(Number(mine.limitation), Number(resp.result.total)) * 1024 - Number(mine.used),
                total: limit
              }
            : { remained: Number(mine.remained), total: Number(resp.result.total) };

      return {
        ...resp.result,
        total: FormatHelper.addComma(resp.result.total),
        used: FormatHelper.addComma(resp.result.used),
        remained: FormatHelper.addComma(resp.result.remained),
        isRepresentation: representation.svcMgmtNum === svcInfo.svcMgmtNum,
        mine: {
          ...mine,
          remained: FormatHelper.convDataFormat(data.remained, DATA_UNIT.MB),
          ratio: Math.round((data.remained / 1024 / data.total) * 100),
          used: FormatHelper.convDataFormat(Number(mine.used), DATA_UNIT.MB),
          shared: FormatHelper.addComma(mine.shared),
          limitation: FormatHelper.addComma(mine.limitation),
          svcNum: FormatHelper.conTelFormatWithDash(mine.svcNum)
        },
        mbrList: resp.result.mbrList.map(member => {
          return {
            ...member,
            used: FormatHelper.convDataFormat(Number(member.used), DATA_UNIT.MB),
            shared: FormatHelper.addComma(member.shared),
            limitation: FormatHelper.addComma(member.limitation),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          };
        })
      };
    });
  }

  private getHistory = () => {
    return this.apiService.request(API_CMD.BFF_06_0071, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const histories = resp.result.mySharePot;
      return histories ? histories.length : 0;
    });
  }
}
