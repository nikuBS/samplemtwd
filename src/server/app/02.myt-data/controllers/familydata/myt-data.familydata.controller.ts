/**
 * FileName: myt-data.familydata.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';

class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getRemainDataInfo(svcInfo).subscribe(familyInfo => {
      if (familyInfo.msg) {
        return this.error.render(res, {
          ...familyInfo,
          svcInfo
        });
      }

      res.render('familydata/myt-data.familydata.html', { svcInfo, pageInfo, familyInfo });
    });
  }

  private getRemainDataInfo(svcInfo) {
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

      return {
        ...resp.result,
        total: Number(resp.result.total),
        used: Number(resp.result.used),
        remained: Number(resp.result.remained),
        isRepresentation: representation.svcMgmtNum === svcInfo.svcMgmtNum,
        mine: {
          ...mine,
          used: Number(mine.used),
          shared: Number(mine.shared),
          limitation: Number(mine.limitation),
          svcNum: FormatHelper.conTelFormatWithDash(mine.svcNum)
        },
        mbrList: resp.result.mbrList.map(member => {
          return {
            ...member,
            used: Number(member.used),
            shared: Number(member.shared),
            limitation: Number(member.limitation),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          };
        })
      };
    });
  }
}

export default MyTDataFamily;
