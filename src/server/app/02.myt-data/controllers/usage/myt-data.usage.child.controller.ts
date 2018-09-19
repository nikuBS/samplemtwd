/**
 * FileName: myt-data.usage.child.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.18
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataUsage from './myt-data.usage.controller';

const VIEW = {
  DEFAULT: 'usage/myt-data.usage.child.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataUsageChild extends TwViewController {
  private myTDataUsage = new MyTDataUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const self = this;
    const childSvcMgmtNum = req.params.childSvcMgmtNum;
    const childUsageReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0001, {
      childSvcMgmtNum: childSvcMgmtNum
    });
    const childrenReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0010, {});
    const baseFeePlanReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {
      childSvcMgmtNum: childSvcMgmtNum
    });
    Observable.combineLatest(childUsageReq, childrenReq, baseFeePlanReq).subscribe(([usageDataResp, childrenResp, baseFeePlanResp]) => {
        if (  usageDataResp.code === API_CODE.CODE_00 &&
              childrenResp.code === API_CODE.CODE_00 &&
              baseFeePlanResp.code === API_CODE.CODE_00 ) {
          const usageData = usageDataResp.result;
          const children = childrenResp.result;
          const baseFeePlan = baseFeePlanResp.result;
          const fomattedData = self.myTDataUsage.parseUsageData(usageData, svcInfo);
          const child = children.find((_child) => {
            return _child.svcMgmtNum === childSvcMgmtNum;
          });
          fomattedData['childSvcNum'] = child.svcNum;
          fomattedData['childProdNm'] = baseFeePlan.prodName;
          res.render(VIEW.DEFAULT, { usageData: fomattedData, svcInfo: svcInfo });
        } else {
          res.render(VIEW.ERROR, { usageData: usageDataResp, svcInfo: svcInfo });
        }
      }
    );
  }
}

export default MyTDataUsageChild;
