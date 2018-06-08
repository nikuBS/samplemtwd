import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { UNIT } from '../../../../types/bff-common.type';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';

class MyTUsage24hour50discount extends TwViewController {
  constructor() {
    super();
  }

  private parseData(usageData: any): any {
    if (usageData) {
      usageData.showUsed = FormatHelper.convDataFormat(usageData.used, UNIT[usageData.unit]);
    }
    return usageData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0008, {}) // 24시간 데이터 50% 할인 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = this.parseData(resp.result);
        const data = {
          svcInfo: svcInfo,
          usageData: usageData,
          startDate: DateHelper.getShortDateAndTime(usageData.couponDate),
          endDate: DateHelper.getAddDay(usageData.couponDate)
        };
        res.render('usage/myt.usage.24hours-50discount.html', data);
      });
  }
}

export default MyTUsage24hour50discount;
