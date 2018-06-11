import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT, UNIT_E } from '../../../../types/bff-common.type';
import { SVC_CD } from '../../../../types/bff-common.type';
import {API_CMD, API_CODE, API_MYT_ERROR_CODE} from '../../../../types/api-command.type';
import { SKIP_NAME } from '../../../../types/string.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff-common.type';
import {Observable} from 'rxjs/Observable';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const newSvcInfo = this.getSvcInfo(svcInfo);
    const remainDate = DateHelper.getRemainDate();

    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      const data = {
        svcInfo: newSvcInfo,
        remainDate,
        usageData
      };

      if (usageData.code === API_CODE.CODE_00) {
        res.render('usage/myt.usage.html', data);
      } else {
        res.render('error/myt.usage.error.html', data);
      }
    });
  }

  private getSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcName = SVC_CD[svcInfo.svcCd];
    }
    return svcInfo;
  }

  private getUsageData(): Observable<any> {
    let usageData = {};
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        usageData = this.parseUsageData(resp.result);
      } else {
        usageData = resp;
      }
      return usageData;
    });
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

    data.couponDate = this.getCouponDate(data.couponDate);
    data.isExceed = data.skipId === SKIP_NAME.EXCEED;
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

  private isError(code: string): boolean {
    let isError = false;
    for (const cd of API_MYT_ERROR_CODE) {
      if (cd === code) {
        isError = true;
      }
    }
    return isError;
  }
}

export default MyTUsage;
