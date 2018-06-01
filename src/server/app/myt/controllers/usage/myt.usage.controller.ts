import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import myTUsageData from '../../../../mock/myt.usage';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT } from '../../../../types/bff-common.type';

import { API_CMD } from '../../../../types/api-command.type';
import { SVC_CD } from '../../../../types/bff-common.type';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  private parseSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_CD[svcInfo.svcCd];
    return svcInfo;
  }

  private parseData(usageData: any): any {
    usageData.data.map((data) => {
      data.showTotal = FormatHelper.convUnit(data.total, UNIT[data.unit]);
      data.showUsed = FormatHelper.convUnit(data.used, UNIT[data.unit]);
      data.showRemained = FormatHelper.convUnit(data.remained, UNIT[data.unit]);
      data.usedRatio = data.used / data.total * 100;
      data.showUsedRatio = 100 - data.usedRatio;
    });
    return usageData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const newSvcInfo = this.parseSvcInfo(svcInfo);

    this.apiService.request(API_CMD.BFF_05_0001, {}) // 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = this.parseData(myTUsageData.result);
        const data = {
          svcInfo: newSvcInfo,
          usageData: usageData, // mock data
          remainDate: DateHelper.getRemainDate()
        };
        res.render('usage/myt.usage.html', data);
      });
  }
}

export default MyTUsage;
