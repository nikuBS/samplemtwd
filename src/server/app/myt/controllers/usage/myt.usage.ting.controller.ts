import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { TING_TITLE } from '../../../../types/bff-common.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';

class MyTUsageTing extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.myTUsage.renderView(res, 'usage/myt.usage.ting.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0007, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if (resp.code === API_CODE.CODE_00) {
      usageData = this.parseUsageData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseUsageData(usageData: any): any {
    if (!FormatHelper.isEmpty(usageData)) {
      usageData.map((data) => {
        this.convShowData(data);
      });
    }
    return usageData;
  }

  private convShowData(data: any) {
    data.title = TING_TITLE[data.skipId];

    data.isUnlimited = !isFinite(data.total);
    data.isUsedUnlimited = !isFinite(data.used);
    data.isRemainUnlimited = !isFinite(data.remained);
    data.remainedRatio = 100;
    data.showUsed = FormatHelper.addComma(data.used);

    if ( !data.isUnlimited ) {
      data.showRemained = FormatHelper.addComma(data.remained);
      data.remainedRatio = data.remained / data.total * 100;
    }
    data.barClassName = this.getBarStayle(data.isUnlimited);
  }

  private getBarStayle(isUnlimited: boolean): string {
    let className = 'progressbar-type01';
    if (isUnlimited) {
      className = 'progressbar-type02';
    }
    return className;
  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo,
      usageData
    };
  }
}

export default MyTUsageTing;
