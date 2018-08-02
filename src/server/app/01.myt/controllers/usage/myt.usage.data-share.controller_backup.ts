import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { USER_CNT } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff-common.type';
import MyTUsage from './myt.usage.controller';
import { Observable } from 'rxjs/Observable';

class MyTUsageDataShare extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.myTUsage.renderView(res, 'usage/myt.usage.data-share_backup.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0004, {}).map((resp) => {
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
    usageData.userCnt = USER_CNT[usageData.childList.length - 1];
    usageData.showTotal = FormatHelper.convDataFormat(usageData.data.used, UNIT[usageData.data.unit]);
    usageData.childList.map((data) => {
      data.setDate = DateHelper.getShortDateNoDot(data.auditDtm);
      data.showUsed = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
    });
    return usageData;
  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo,
      usageData
    };
  }
}

export default MyTUsageDataShare;
