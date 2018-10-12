/**
 * FileName: myt-data.family.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.old.type';
// import { BFF_06_0044_familyInfo, BFF_06_0045_ImmediatelyInfo, BFF_06_0047_MonthlyInfo } from '../../../../mock/server/myt.data.family.mock';
import { Observable } from 'rxjs/Observable';

class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    let responseData: any = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch (page) {
      case 'complete':
        res.render('family/myt-data.family.complete.html', {
          ...responseData,
          query: req.query
        });
        break;
      case 'setting':
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

          responseData = {
            ...responseData,
            immediatelyInfo,
            monthlyInfo
          };

          res.render('family/myt-data.family.setting.html', responseData);
        });
        break;
      default:
        this.getRemainDataInfo().subscribe(familyInfo => {
          if (familyInfo.msg) {
            return this.error.render(res, {
              ...familyInfo,
              svcInfo
            });
          }
          responseData = {
            ...responseData,
            familyInfo
          };

          res.render('family/myt-data.family.main.html', responseData);
        });
    }
  }

  private getRemainDataInfo() {
    return this.apiService.request(API_CMD.BFF_06_0044, {}).map(resp => {
      // const result = BFF_06_0044_familyInfo.result;
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      const representation = resp.result.mbrList.find(member => member.repYn === 'Y');

      return {
        ...resp.result,
        total: this.convertTFamilyDataSet(resp.result.total),
        used: this.convertTFamilyDataSet(resp.result.used),
        remained: this.convertTFamilyDataSet(resp.result.remained),
        representation: representation ? representation.svcMgmtNum : ''
      };
    });
  }

  private getImmediatelyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0045, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      return resp.result;
    });
    // return BFF_06_0045_ImmediatelyInfo.result;
  }

  private getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0045, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      return resp.result;
    });
    // return BFF_06_0047_MonthlyInfo.result;
  }

  private convertTFamilyDataSet(sQty) {
    return FormatHelper.convDataFormat(sQty, DATA_UNIT.MB);
  }
}

export default MyTDataFamily;
