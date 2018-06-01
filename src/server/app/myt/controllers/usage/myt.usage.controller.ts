import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import myTUsageData from '../../../../mock/myt.usage';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT } from '../../../../types/bff-common.type';

import { API_CMD } from '../../../../types/api-command.type';
import { SVC_CD } from '../../../../types/bff-common.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff-common.type';

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
      const isTotalUnlimited = data.total === '무제한';
      const isUsedUnlimited = data.used === '무제한';
      const isRemainUnlimited = data.remained === '무제한';

      data.isUnlimited = isTotalUnlimited;
      data.showTotal = isTotalUnlimited ? data.total : FormatHelper.convDataFormat(data.total, UNIT[data.unit]);
      data.showUsed = isUsedUnlimited ? data.used : FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
      data.showRemained = isRemainUnlimited ? data.remained : FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
      data.usedRatio = (!isTotalUnlimited && !isUsedUnlimited) && (data.used / data.total * 100);
      data.showUsedRatio = isTotalUnlimited ? 100 : 100 - data.usedRatio;
      data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
    });
    return usageData;
  }

  private isVisibleDayBtn(skipId: any): boolean {
    let isVisible = false;
    for (const item of DAY_BTN_STANDARD_SKIP_ID) {
      if (item === skipId) {
        isVisible = true;
      }
    }
    return isVisible;
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
