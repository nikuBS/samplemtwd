import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT, UNIT_E } from '../../../../types/bff-common.type';
import { SVC_CD } from '../../../../types/bff-common.type';
import { API_CMD, API_CODE} from '../../../../types/api-command.type';
import { SKIP_NAME, MYT_VIEW } from '../../../../types/string.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff-common.type';
import { Observable } from 'rxjs/Observable';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.renderView(res, 'usage/myt.usage.html', this.getData(usageData, svcInfo));
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    if (data.code === undefined) {
      res.render(view, data);
    } else {
      res.render(MYT_VIEW.ERROR, data);
    }
  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo: this.getSvcInfo(svcInfo),
      remainDate: DateHelper.getRemainDate(),
      usageData
    };
  }

  private getSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcName = SVC_CD[svcInfo.svcCd];
    }
    return svcInfo;
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      return this.getResult(resp);
    });
  }

  private getResult(resp: any): any {
    let usageData = {};
    if (resp.code === API_CODE.CODE_00) {
      usageData = this.parseUsageData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];

    kinds.map((kind) => {
        if (!FormatHelper.isEmpty(usageData[kind])) {
          usageData[kind].map((data) => {
            this.convShowData(data);
          });
        }
    });
    return usageData;
  }

  private convShowData(data: any) {
    data.isUnlimited = !isFinite(data.total);
    data.isUsedUnlimited = !isFinite(data.used);
    data.isRemainUnlimited = !isFinite(data.remained);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);

    if ( !data.isUnlimited ) {
      data.showUsed = this.convFormat(data.used, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = data.remained / data.total * 100;
    }

    data.isExceed = data.skipId === SKIP_NAME.EXCEED;
    data.couponDate = this.getCouponDate(data.couponDate);
    data.barClassName = this.getBarStayle(data.isUnlimited);
    data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
  }

  private convFormat(data: string, unit: string): string {
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.SMS:
        return FormatHelper.addComma(data);
      case UNIT_E.FEE:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }

  private getCouponDate(date: string): string {
    let couponDate = '';
    if (couponDate !== '' && couponDate !== null) {
      couponDate = DateHelper.getShortDateNoDot(date);
    }
    return couponDate;
  }

  private getBarStayle(isUnlimited: boolean): string {
    let className = 'progressbar-type01';
    if (isUnlimited) {
      className = 'progressbar-type02';
    }
    return className;
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
}

export default MyTUsage;
