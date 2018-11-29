/**
 * FileName: myt-data.familydata.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.old.type';
import { Observable } from 'rxjs/Observable';

class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const page = req.url.replace('/familydata', '');

    switch (page) {
      case '/share':
        Observable.combineLatest(this.getImmediatelyInfo(), this.getMonthlyInfo()).subscribe(([immediatelyInfo, monthlyInfo]) => {
          const error = {
            code: immediatelyInfo.code || monthlyInfo.code,
            msg: immediatelyInfo.msg || monthlyInfo.msg
          };

          if (error.code) {
            return this.error.render(res, {
              ...error,
              svcInfo: svcInfo
            });
          }

          res.render('familydata/myt-data.familydata.share.html', {
            svcInfo,
            pageInfo,
            immediatelyInfo,
            monthlyInfo,
            isApp: BrowserHelper.isApp(req)
          });
        });
        break;
      default:
        this.getRemainDataInfo(svcInfo).subscribe(familyInfo => {
          if (familyInfo.msg) {
            return this.error.render(res, {
              ...familyInfo,
              svcInfo
            });
          }

          res.render('familydata/myt-data.familydata.html', { svcInfo, pageInfo, familyInfo, isApp: BrowserHelper.isApp(req) });
        });
    }
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
      // const mine = resp.result.mbrList.find(member => member.svcMgmtNum === svcInfo.svcMgmtNum);
      const mine = resp.result.mbrList.find(member => member.svcMgmtNum === '7226057315');

      return {
        ...resp.result,
        total: FormatHelper.convDataFormat(resp.result.total, DATA_UNIT.GB),
        used: FormatHelper.convDataFormat(resp.result.used, DATA_UNIT.MB),
        remained: FormatHelper.convDataFormat(resp.result.remained, DATA_UNIT.MB),
        isRepresentation: representation.svcMgmtNum === svcInfo.svcMgmtNum,
        mine
      };
    });
  }

  private getImmediatelyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0045, { reqCnt: 0 }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      return resp.result;
    });
  }

  private getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0047, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      return resp.result;
    });
  }
}

export default MyTDataFamily;
