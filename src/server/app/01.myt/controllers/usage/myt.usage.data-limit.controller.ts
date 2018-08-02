import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DataLimit from '../../../../mock/server/myt.data-limit.mock';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageDataLimit extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.myTUsage.renderView(res, 'usage/myt.usage.data-limit.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0006, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      usageData = this.parseData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseData(usageData: any): any {
    const data = {
      'skipId': '공제항목ID',
      'skipName': '데이터 충전금액 5,000원',
      'total': '5000',
      'used': '3200',
      'remained': '1800',
      'unit': '110',
      'couponDate': '20180101'
    };
    data['usedRatio'] = parseInt(data.remained, 10) / parseInt(data.total, 10) * 100;
    data['total'] = FormatHelper.addComma(data.total);
    data['used'] = FormatHelper.addComma(data.used);
    data['remained'] = FormatHelper.addComma(data.remained);
    console.log('~~~~~~~~~~~~~~data', data);
    return data;
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

export default MyTUsageDataLimit;
