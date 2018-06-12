import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import DateHelper from '../../../../../utils/date.helper';
import FormatHelper from '../../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import LineService from '../../../../../services/line.service';
import MyTUsage from '../../usage/myt.usage.controller';

class MyTRefill extends TwViewController {
  public myTUsage = new MyTUsage();
  public lineService = new LineService();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getLineList(),
      this.getusageData()
    ).subscribe(([lineList, usageData]) => {
      this.myTUsage.renderView(res, 'refillrecharge/refill/refill.html', this.getData(lineList, usageData));
    });
  }

  private getLineList(): any {
    return this.lineService.getMobileLineList();
  }

  private getusageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
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
    if (!FormatHelper.isEmpty(usageData)) {
      usageData.map((data) => {
        data.startDate = DateHelper.getShortDateNoDot(data.usePsblStaDt);
        data.endDate = DateHelper.getShortDateNoDot(data.usePsblEndDt);
      });
    }
    return usageData;
  }

  private getData(lineList: any, usageData: any): any {
    return {
      lineList: lineList.result,
      usageData
    };
  }
}

export default MyTRefill;
