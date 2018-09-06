// Author Ara Jo (araara.jo@sk.com)

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { UNIT, UNIT_E } from '../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

class HomeMainSprint3 extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const remainDate = DateHelper.getRemainDate();

    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      const data = {
        svcInfo,
        remainDate,
        usageData
      };
      res.render('home.main.sprint3.html', data);
    });
  }

  private getUsageData(): Observable<any> {
    let usageData = {
      prodName: null
    };
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = this.parseUsageData(resp.result);
      }
      return usageData;
    });
  }


  private parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms'];

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData.main[kind]) ) {
        this.convShowData(usageData.main[kind]);
      }
    });
    return usageData;
  }

  private convShowData(data: any) {
    data.isUnlimit = !isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = data.remained / data.total * 100;
    }
  }

  private convFormat(data: string, unit: string): string {
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }
}

export default HomeMainSprint3;
