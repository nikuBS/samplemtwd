/**
 * FileName: myt-data.usage.total-sharing-data.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.08
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, SESSION_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataHotData from './myt-data.hotdata.controller';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_TOTAL_SHARING_DATA } from '../../../../types/string.type';

class MyTDataUsageTotalSharingData extends TwViewController {
  private myTDataHotData = new MyTDataHotData();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqBalances(),
      this.reqBalanceAddOns(),
    ).subscribe(([_balancesResp, balanceAddOnsResp]) => {
      const balancesResp = JSON.parse(JSON.stringify(_balancesResp));
      const apiError = this.error.apiError([
        balancesResp, balanceAddOnsResp
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const usageData = this.myTDataHotData.parseCellPhoneUsageData(balancesResp.result, svcInfo);
      let defaultData;
      if (usageData.hasDefaultData) {
        defaultData = usageData.data[0];
        this.convShowData(defaultData);
      }

      const option = {
        defaultData: defaultData || {},
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {}
      };

      option['balanceAddOns'] = balanceAddOnsResp.result;
      res.render('usage/myt-data.usage.total-sharing-data.html', option);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  private reqBalances(): Observable<any> {
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {});
  }

  private reqBalanceAddOns(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0002, {});
  }

  private convShowData(data: any) {
    data.isUnlimited = !isFinite(data.total);
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_TOTAL_SHARING_DATA.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }
}

export default MyTDataUsageTotalSharingData;
