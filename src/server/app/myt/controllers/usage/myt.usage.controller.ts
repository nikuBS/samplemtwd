import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import myTUsageData from '../../../../mock/server/myt.usage';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT } from '../../../../types/bff-common.type';

import { API_CMD } from '../../../../types/api-command.type';
import { SVC_CD } from '../../../../types/bff-common.type';
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
    usageData.data.map((data) => {
      const isTotalUnlimited = data.total === '무제한';
      const isUsedUnlimited = data.used === '무제한';
      const isRemainUnlimited = data.remained === '무제한';
      const isExceed = data.skipId === 'LT';

      data.isUnlimited = isTotalUnlimited;
      data.showTotal = isTotalUnlimited ? data.total : FormatHelper.convDataFormat(data.total, UNIT[data.unit]);
      data.showUsed = isUsedUnlimited ? data.used : FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
      data.showRemained = isRemainUnlimited ? data.remained : FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
      data.usedRatio = (!isTotalUnlimited && !isUsedUnlimited) && (data.used / data.total * 100);
      data.showRemainedRatio = isTotalUnlimited ? 100 : 100 - data.usedRatio;
      data.couponDate = data.couponDate === '' ? data.couponDate : DateHelper.getShortDateNoDot(data.couponDate);
      data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
      data.isExceed = isExceed;
      data.barClassName = isTotalUnlimited ? 'progressbar-type02' : 'progressbar-type01';
    });

    usageData.voice.map((voice) => {
      const isTotalUnlimited = voice.total === '무제한';
      const isUsedUnlimited = voice.used === '무제한';
      const isRemainUnlimited = voice.remained === '무제한';

      voice.isUnlimited = isTotalUnlimited;
      voice.showTotal = isTotalUnlimited ? voice.total : FormatHelper.convVoiceFormat(voice.total);
      voice.showUsed = isUsedUnlimited ? voice.used : FormatHelper.convVoiceFormat(voice.used);
      voice.showRemained = isRemainUnlimited ? voice.remained : FormatHelper.convVoiceFormat(voice.remained);
      voice.usedRatio = (!isTotalUnlimited && !isUsedUnlimited) && (voice.used / voice.total * 100);
      voice.showRemainedRatio = isTotalUnlimited ? 100 : 100 - voice.usedRatio;
      voice.couponDate = voice.couponDate === '' ? voice.couponDate : DateHelper.getShortDateNoDot(voice.couponDate);
      voice.barClassName = isTotalUnlimited ? 'progressbar-type02' : 'progressbar-type01';
    });

    usageData.sms.map((sms) => {
      const isTotalUnlimited = sms.total === '기본제공량';
      const isUsedUnlimited = sms.used === '무제한';
      const isRemainUnlimited = sms.remained === '무제한';

      sms.isUnlimited = isTotalUnlimited;
      sms.showTotal = isTotalUnlimited ? sms.total : FormatHelper.convNumFormat(sms.total);
      sms.showUsed = isUsedUnlimited ? sms.used : FormatHelper.convNumFormat(sms.used);
      sms.showRemained = isRemainUnlimited ? sms.remained : FormatHelper.convNumFormat(sms.remained);
      sms.usedRatio = (!isTotalUnlimited && !isUsedUnlimited) && (sms.used / sms.total * 100);
      sms.showRemainedRatio = isTotalUnlimited ? 100 : 100 - sms.usedRatio;
      sms.couponDate = sms.couponDate === '' ? sms.couponDate : DateHelper.getShortDateNoDot(sms.couponDate);
      sms.barClassName = isTotalUnlimited ? 'progressbar-type02' : 'progressbar-type01';
    });

    usageData.etc.map((etc) => {
      const isTotalUnlimited = etc.total === '무제한';

      etc.isUnlimited = isTotalUnlimited;
      etc.showTotal = isTotalUnlimited ? etc.total : FormatHelper.convVoiceFormat(etc.total);
      etc.showUsed = FormatHelper.convVoiceFormat(etc.used);
      etc.showRemained = FormatHelper.convVoiceFormat(etc.remained);
      etc.usedRatio = (!isTotalUnlimited) && (etc.used / etc.total * 100);
      etc.showRemainedRatio = isTotalUnlimited ? 100 : 100 - etc.usedRatio;
      etc.couponDate = etc.couponDate === '' ? etc.couponDate : DateHelper.getShortDateNoDot(etc.couponDate);
      etc.barClassName = isTotalUnlimited ? 'progressbar-type02' : 'progressbar-type01';
    });

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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const newSvcInfo = this.parseSvcInfo(svcInfo);

    this.apiService.request(API_CMD.BFF_05_0001, {}) // 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = this.parseData(myTUsageData.result);
        const data = {
          svcInfo: newSvcInfo,
          usageData: usageData, // mock data
          remainDate: DateHelper.getRemainDate()
        };
        res.render('usage/myt.usage.html', data);
      });
  }
}

export default MyTUsage;
