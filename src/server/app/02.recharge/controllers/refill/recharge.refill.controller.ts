/**
* FileName: recharge.refill.controller.ts
* Author: 공자윤 (jayoon.kong@sk.com)
* Date: 2018.06.18
**/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { COUPON_STATUS_CODE, LINE_NAME } from '../../../../types/bff-common.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import MyTUsage from '../../../01.myt/controllers/usage/myt.usage.controller';

class RechargeRefill extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getLineList(),
      this.getUsageOptions(),
      this.getusageData()
    ).subscribe(([lineList, usageOptions, usageData]) => {
      this.myTUsage.renderView(res, 'refill/recharge.refill.html', this.getData(lineList, usageOptions, usageData, svcInfo));
    });
  }

  private getLineList(): any {
    return this.apiService.request(API_CMD.BFF_03_0003_C, { svcCtg: LINE_NAME.MOBILE });
  }

  private getUsageOptions(): any {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
      return this.getResult(resp, {}, 'option');
    });
  }

  private getusageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, data: any, option?: string): any {
    if (resp.code === API_CODE.CODE_00) {
      if (option === undefined) {
        data = this.parseData(resp.result);
      } else {
        data = {
          option: resp.result.option,
          condition: resp.result.condition
        };
      }
    } else {
      data = resp;
    }
    return data;
  }

  private parseData(usageData: any): any {
    if (!FormatHelper.isEmpty(usageData)) {
      usageData.map((data) => {
        data.startDate = DateHelper.getShortDateNoDot(data.usePsblStaDt);
        data.endDate = DateHelper.getShortDateNoDot(data.usePsblEndDt);
        data.endDateFormat = DateHelper.getShortKoreanDate(data.usePsblEndDt);
        data.isueDate = DateHelper.getShortDateNoDot(data.copnIsueDt);
        data.remainDate = DateHelper.getNewRemainDate(data.usePsblEndDt);
        data.isReceived = data.copnOperStCd === COUPON_STATUS_CODE.RECEIVED;
      });
    }
    return usageData;
  }

  private getData(lineList: any, usageOptions: any, usageData: any, svcInfo: any): any {
    return {
      lineList: lineList.result,
      usageOptions,
      usageData,
      svcInfo
    };
  }
}

export default RechargeRefill;
