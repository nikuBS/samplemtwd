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
    const childProdNm = req.query.childProdNm; // 요금제명
    const childSvcNum = req.query.childSvcNum; // 회선정보
    Observable.combineLatest(this.apiService.request(API_CMD.BFF_05_0001, {
      childSvcMgmtNum: childSvcMgmtNum
    })).subscribe(([usageData]) => {
        if ( usageData.code === API_CODE.CODE_00 ) {
          const fomattedData = self.myTDataUsage.parseUsageData(usageData.result, svcInfo);
          fomattedData['childProdNm'] = childProdNm;
          fomattedData['childSvcNum'] = childSvcNum;
          res.render(VIEW.DEFAULT, { usageData: fomattedData, svcInfo: svcInfo });
        } else {
          res.render(VIEW.ERROR, { usageData: usageData, svcInfo: svcInfo });
        }
      }
    );
  }
}

export default MyTDataUsageChild;
