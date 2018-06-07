import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { UNIT } from '../../../types/bff-common.type';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

class HomeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const remainDate = DateHelper.getRemainDate();

    Observable.combineLatest([
      this.getUsageData()
    ]).subscribe((usageData) => {
      console.log(usageData);
      const data = {
        svcInfo,
        remainDate,
        usageData
      };
      res.render('home.main.html', data);
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
    if ( !FormatHelper.isEmpty(usageData.data) ) {
      usageData.data.map((data) => {
        data.isUnlimit = !isFinite(data.total);
        data.remainedRatio = 100;
        data.showUsed = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
        if ( !data.isUnlimit ) {
          data.showTotal = FormatHelper.convDataFormat(data.total, UNIT[data.unit]);
          data.showRemained = FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
          data.remainedRatio = data.remained / data.total * 100;
        }
      });
    }

    if ( !FormatHelper.isEmpty(usageData.voice) ) {
      usageData.voice.map((voice) => {
        voice.isUnlimit = !isFinite(voice.total);
        voice.remainedRatio = 100;
        voice.showUsed = FormatHelper.convVoiceFormat(voice.used);
        if ( !voice.isUnlimit ) {
          voice.showTotal = FormatHelper.convVoiceFormat(voice.total);
          voice.showRemained = FormatHelper.convVoiceFormat(voice.remained);
          voice.remainedRatio = voice.remained / voice.total * 100;
        }
      });
    }

    if ( !FormatHelper.isEmpty(usageData.sms) ) {
      usageData.sms.map((sms) => {
        sms.isUnlimit = !isFinite(sms.total);
        sms.remainedRatio = 100;
        if ( !sms.isUnlimit ) {
          sms.remainedRatio = sms.remained / sms.total * 100;
        }
      });
    }

    return usageData;
  }
}

export default HomeMain;
