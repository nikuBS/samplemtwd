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
    let responseData: any = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

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

          responseData = {
            ...responseData,
            immediatelyInfo,
            monthlyInfo
          };

          res.render('familydata/myt-data.familydata.share.html', responseData);
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
            familyInfo,
            pageInfo
          };

          res.render('familydata/myt-data.familydata.html', responseData);
        });
    }
  }

  private getRemainDataInfo() {
    return this.apiService.request(API_CMD.BFF_06_0044, {}).map(resp => {
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

  private convertTFamilyDataSet(sQty) {
    return FormatHelper.convDataFormat(sQty, DATA_UNIT.MB);
  }
}

export default MyTDataFamily;
