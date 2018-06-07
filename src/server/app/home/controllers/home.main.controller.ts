import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_MYT_ERROR_CODE } from '../../../types/api-command.type';
import myTUsageData from '../../../mock/server/myt.usage';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { UNIT } from '../../../types/bff-common.type';

class HomeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const remainDate = DateHelper.getRemainDate();
    // TODO deleted
    let usageData = this.parseData(myTUsageData.result);

    this.apiService.request(API_CMD.BFF_05_0001, {}).subscribe((resp) => {
      this.logger.debug(this, resp);
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = this.parseData(resp.result);
      } else {
        // error 처리 필요
      }

      console.log(usageData);
      res.render('home.main.html', {
        usageData,
        svcInfo,
        remainDate
      });
    });
  }

  private parseData(usageData: any): any {
    if ( !FormatHelper.isEmpty(usageData.data) ) {
      usageData.data.map((data) => {
        data.isUnlimit = !isFinite(data.total);
        data.usedRatio = 100;
        if ( !data.isUnlimit ) {
          data.showTotal = FormatHelper.convDataFormat(data.total, UNIT[data.unit]);
          data.showUsed = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
          data.showRemained = FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
          data.usedRatio = data.remained / data.total * 100;
        }
      });
    }

    if ( !FormatHelper.isEmpty(usageData.voice) ) {
      usageData.voice.map((voice) => {
        voice.isUnlimit = !isFinite(voice.total);
        voice.usedRatio = 100;
        if ( !voice.isUnlimit ) {
          voice.showTotal = FormatHelper.convVoiceFormat(voice.total);
          voice.showUsed = FormatHelper.convVoiceFormat(voice.used);
          voice.showRemained = FormatHelper.convVoiceFormat(voice.remained);
          voice.usedRatio = voice.remained / voice.total * 100;
        }
      });
    }

    if ( !FormatHelper.isEmpty(usageData.sms) ) {
      usageData.sms.map((sms) => {
        sms.isUnlimit = !isFinite(sms.total);
        sms.usedRatio = 100;
        if ( !sms.isUnlimit ) {
          sms.usedRatio = sms.remained / sms.total * 100;
        }
      });
    }

    return usageData;
  }
}

export default HomeMain;
