import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { UNIT } from '../../../../types/bff.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';
import { DATA_UNIT } from '../../../../types/string.type';
import moment = require('moment');

class MyTUsage24hour50discount extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      res.render('usage/myt.usage.24hours-50discount.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0008, {}).map((resp) => {
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

  private parseData(data: any): any {
    // const data = {
    //   'skipId': '공제항목ID',
    //   'skipName': '공제항목명',
    //   'total': '기본제공량',
    //   'used': '900000',
    //   'remained': '잔여량',
    //   'unit': '140',
    //   'couponDate': '201404011410'
    // };
    const DATE_FORMAT = 'YYYY.MM.DD HH:mm';
    const startDate = DateHelper.convDateFormat(data.couponDate);
    const endDate = moment(startDate).add(1, 'days').add(-1, 'minutes');
    data['used'] = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
    data['startDateStr'] = DateHelper.getShortDateWithFormat(startDate, DATE_FORMAT);
    data['endDateStr'] = DateHelper.getShortDateWithFormat(endDate, DATE_FORMAT);
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

export default MyTUsage24hour50discount;
