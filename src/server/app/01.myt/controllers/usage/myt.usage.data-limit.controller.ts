import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DataLimit from '../../../../mock/server/myt.data-limit.mock';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageDataLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      res.render('usage/myt.usage.data-limit.html', this.getData(usageData, svcInfo));
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
    // const data = {
    //   'skipId': '공제항목ID',
    //   'skipName': '데이터 충전금액 5,000원',
    //   'total': '5000',
    //   'used': '3200',
    //   'remained': '1800',
    //   'unit': '110',
    //   'couponDate': '20180101'
    // };
    usageData['usedRatio'] = (parseInt(usageData.remained, 10) / parseInt(usageData.total, 10) * 100) || 0;
    usageData['total'] = FormatHelper.addComma(usageData.total) || 0;
    usageData['used'] = FormatHelper.addComma(usageData.used) || 0;
    usageData['remained'] = FormatHelper.addComma(usageData.remained) || 0;
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

export default MyTUsageDataLimit;
