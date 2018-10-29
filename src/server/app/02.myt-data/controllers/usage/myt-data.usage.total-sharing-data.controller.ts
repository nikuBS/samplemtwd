/**
 * FileName: myt-data.usage.total-sharing-data.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.08
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataUsage from './myt-data.usage.controller';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_TOTAL_SHARING_DATA } from '../../../../types/string.type';

class MyTDataUsageTotalSharingData extends TwViewController {
  private myTDataUsage = new MyTDataUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqBalances(),
      this.reqBalanceAddOns(),
    ).subscribe(([balancesResp, balanceAddOnsResp]) => {
      const apiError = this.error.apiError([
        balancesResp, balanceAddOnsResp
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return res.render('error.server-error.html', {
          title: MYT_DATA_USAGE_TOTAL_SHARING_DATA.TITLE,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const fomattedData = this.myTDataUsage.parseUsageData(balancesResp.result, svcInfo);
      const defaultData = this.getDefaultData(fomattedData.data)[0];

      if (!defaultData) {
        return this.error.render(res, {
          title: MYT_DATA_USAGE_TOTAL_SHARING_DATA.TITLE,
          svcInfo: svcInfo
        });
      }

      const option = {
        defaultData: defaultData || {},
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {}
      };

      option['balanceAddOns'] = balanceAddOnsResp.result;
      // option['balanceAddOns'].sharingService.dataSharing = afterRequestSuccess'Y';
      res.render('usage/myt-data.usage.total-sharing-data.html', option);

    });
  }

  private reqBalances(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {});
  }

  private reqBalanceAddOns(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0002, {});
  }

  private getDefaultData(datas: any): any {
    return datas.filter((data) => {
      return data.sharedData;
    });
  }
}

export default MyTDataUsageTotalSharingData;
