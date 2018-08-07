import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { UNIT } from '../../../../types/bff.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';

class MyTUsage24hour50discount extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.myTUsage.renderView(res, 'usage/myt.usage.24hours-50discount_backup.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0008, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if (resp.code === API_CODE.CODE_00) {
      usageData = this.parseData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseData(usageData: any): any {
    if (usageData) {
      usageData.showUsed = FormatHelper.convDataFormat(usageData.used, UNIT[usageData.unit]);
    }
    return usageData;
  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo,
      usageData,
      startDate: DateHelper.getShortDateAndTime(usageData.couponDate),
      endDate: DateHelper.getAddDay(usageData.couponDate)
    };
  }
}

export default MyTUsage24hour50discount;
