/**
 * FileName: myt-data.usage.child.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.18
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataUsage from './myt-data.usage.controller';
import FormatHelper from '../../../../utils/format.helper';
import {  MYT_DATA_CHILD_USAGE } from '../../../../types/string.type';

const VIEW = {
  DEFAULT: 'usage/myt-data.usage.child.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataUsageChild extends TwViewController {
  private myTDataUsage = new MyTDataUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const self = this;
    const childSvcMgmtNum = req.query.childSvcMgmtNum;
    if (FormatHelper.isEmpty(childSvcMgmtNum)) {
      return this.renderErr(res, svcInfo, {});
    }
    const childUsageReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0001, {
      childSvcMgmtNum: childSvcMgmtNum
    });
    const baseFeePlanReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {
      childSvcMgmtNum: childSvcMgmtNum
    });
    Observable.combineLatest(childUsageReq, baseFeePlanReq).subscribe(([usageDataResp, baseFeePlanResp]) => {
      const apiError = this.error.apiError([
        usageDataResp, baseFeePlanResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, svcInfo, apiError);
      }

      const usageData = usageDataResp.result;
      const baseFeePlan = baseFeePlanResp.result;
      const fomattedData = self.myTDataUsage.parseUsageData(usageData, svcInfo);
      const child = childInfo.find((_child) => {
        return _child.svcMgmtNum === childSvcMgmtNum;
      });
      fomattedData['childSvcNum'] = child.svcNum;
      fomattedData['childProdId'] = baseFeePlan.prodId;
      fomattedData['childProdNm'] = baseFeePlan.prodName;
      res.render(VIEW.DEFAULT, { usageData: fomattedData, svcInfo, pageInfo });
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
  }

  private renderErr(res, svcInfo, err): any {
    const option = {
      title: MYT_DATA_CHILD_USAGE.TITLE,
      svcInfo
    };
    if (err) {
      Object.assign(option, err);
    }
    return this.error.render(res, option);
  }

}

export default MyTDataUsageChild;
