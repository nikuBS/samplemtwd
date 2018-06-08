import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT, UNIT_E } from '../../../../types/bff-common.type';
import { SVC_CD } from '../../../../types/bff-common.type';
import { API_CMD, API_MYT_ERROR_CODE} from '../../../../types/api-command.type';
import { SKIP_NAME } from '../../../../types/string.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff-common.type';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  private parseSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcName = SVC_CD[svcInfo.svcCd];
    }
    return svcInfo;
  }

  private parseData(usageData: any): any {
    if (!FormatHelper.isEmpty(usageData.data)) {
      usageData.data.map((data) => {
        data.isUnlimited = !isFinite(data.total);
        data.isUsedUnlimited = !isFinite(data.used);
        data.isRemainUnlimited = !isFinite(data.remained);
        data.showUsed = !data.isUsedUnlimited && FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
        data.showRemained = !data.isRemainUnlimited && FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
        data.usedRatio = (!data.isUnlimited && !data.isUsedUnlimited) && (data.used / data.total * 100);
        data.showRemainedRatio = data.isUnlimited ? 100 : 100 - data.usedRatio;
        data.couponDate = data.couponDate === '' ? data.couponDate : DateHelper.getShortDateNoDot(data.couponDate);
        data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
        data.isExceed = data.skipId === SKIP_NAME.EXCEED;
        data.barClassName = data.isUnlimited ? 'progressbar-type02' : 'progressbar-type01';
      });
    }

    if (!FormatHelper.isEmpty(usageData.voice)) {
      usageData.voice.map((voice) => {
        voice.isUnlimited = !isFinite(voice.total);
        voice.isUsedUnlimited = !isFinite(voice.used);
        voice.isRemainUnlimited = !isFinite(voice.remained);
        voice.showUsed = !voice.isUsedUnlimited && FormatHelper.convVoiceFormat(voice.used);
        voice.showRemained = !voice.isRemainUnlimited && FormatHelper.convVoiceFormat(voice.remained);
        voice.usedRatio = (!voice.isUnlimited && !voice.isUsedUnlimited) && (voice.used / voice.total * 100);
        voice.showRemainedRatio = voice.isUnlimited ? 100 : 100 - voice.usedRatio;
        voice.couponDate = voice.couponDate === '' ? voice.couponDate : DateHelper.getShortDateNoDot(voice.couponDate);
        voice.barClassName = voice.isUnlimited ? 'progressbar-type02' : 'progressbar-type01';
      });
    }

    if (!FormatHelper.isEmpty(usageData.sms)) {
      usageData.sms.map((sms) => {
        sms.isUnlimited = !isFinite(sms.total);
        sms.isUsedUnlimited = !isFinite(sms.used);
        sms.isRemainUnlimited = !isFinite(sms.remained);
        sms.showUsed = !sms.isUsedUnlimited && FormatHelper.addComma(sms.used);
        sms.showRemained = !sms.isRemainUnlimited && FormatHelper.addComma(sms.remained);
        sms.usedRatio = (!sms.isUnlimited && !sms.isUsedUnlimited) && (sms.used / sms.total * 100);
        sms.showRemainedRatio = sms.isUnlimited ? 100 : 100 - sms.usedRatio;
        sms.couponDate = sms.couponDate === '' ? sms.couponDate : DateHelper.getShortDateNoDot(sms.couponDate);
        sms.barClassName = sms.isUnlimited ? 'progressbar-type02' : 'progressbar-type01';
      });
    }

    if (!FormatHelper.isEmpty(usageData.etc)) {
      usageData.etc.map((etc) => {
        etc.isUnlimited = !isFinite(etc.total);
        etc.isUsedUnlimited = !isFinite(etc.used);
        etc.isRemainUnlimited = !isFinite(etc.remained);
        etc.isMoney = etc.unit === UNIT_E.FEE;
        etc.showUsed = !etc.isUsedUnlimited &&
          (etc.isMoney ? FormatHelper.addComma(etc.used) : FormatHelper.convVoiceFormat(etc.used));
        etc.showRemained = !etc.isRemainUnlimited &&
          (etc.isMoney ? FormatHelper.addComma(etc.remained) : FormatHelper.convVoiceFormat(etc.remained));
        etc.usedRatio = (!etc.isUnlimited && !etc.isUsedUnlimited) && (etc.used / etc.total * 100);
        etc.showRemainedRatio = etc.isUnlimited ? 100 : 100 - etc.usedRatio;
        etc.couponDate = etc.couponDate === '' ? etc.couponDate : DateHelper.getShortDateNoDot(etc.couponDate);
        etc.barClassName = etc.isUnlimited ? 'progressbar-type02' : 'progressbar-type01';
      });
    }

    return usageData;
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const newSvcInfo = this.parseSvcInfo(svcInfo);

    this.apiService.request(API_CMD.BFF_05_0001, {}).subscribe((resp) => { // 사용량 조회
        console.log(resp);

        const isError = this.isError(resp.code);
        if (isError) {
          const errorData = {
            svcInfo: newSvcInfo,
            err: resp
          };
          res.render('error/myt.usage.error.html', errorData);
        } else {
          const usageData = this.parseData(resp.result);
          const data = {
            svcInfo: newSvcInfo,
            usageData: usageData, // mock data
            remainDate: DateHelper.getRemainDate()
          };
          res.render('usage/myt.usage.html', data);
        }
      });
  }
}

export default MyTUsage;
