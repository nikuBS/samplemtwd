/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.
 *
 */

/**
 * FileName: myt.joinService.protect.change.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { USAGE_PATTERN_CHART } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

import _ from 'lodash';

class MytJSProtectChangeController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.logger.info(this, 'UserInfo ', svcInfo);
    let data = {
      svcInfo: svcInfo
    };
    const api = this.getPatternApi(svcInfo);
    if ( !api ) {
      // 제공하지 않는 유형의 서비스인 경우
      res.render('usage/myt.usage.pattern.fail.html', { data });
    } else {
      const usageFeePatternSevice: Observable<any> = this.apiService.request(api[0], {});
      const usagePatternSevice: Observable<any> = this.apiService.request(api[1], {});
      Observable.combineLatest(
        usageFeePatternSevice,
        usagePatternSevice
      ).subscribe(([feeData, patternData]) => {
        if ( feeData.code === API_CODE.CODE_00 ) {
          const conf_data = this.convertFeeData(feeData);
          data = _.extend(data, conf_data);
        }
        if ( patternData.code === API_CODE.CODE_00 ) {
          const conp_data = this.convertPatternData(patternData);
          data = _.extend(data, conp_data);
        }
        res.render('usage/myt.usage.pattern.html', { data });
      });
    }
  }

  getPatternApi(svcInfo): any {
    const svcAttrCd = svcInfo.svcAttrCd;
    // 0: 사용요금, 1: 사용량
    switch ( svcAttrCd ) {
      case 'M1':
        return [API_CMD.BFF_05_0059, API_CMD.BFF_05_0091];
      case 'M3':
      case 'M4':
        return [API_CMD.BFF_05_0073, API_CMD.BFF_05_0073];
      default:
        return null;
    }
  }

  convertFeeData(response): any {
    const result: any = {
      title: USAGE_PATTERN_CHART.USED
    };
    if ( response.result && response.result.useAmtMonthInfos ) {
      const data = response.result.useAmtMonthInfos;
      const length = data.length;
      const months: any = [];
      const totalCharge: any = [];
      const discountAdj: any = [];
      let useAv = 0;
      let disAv = 0;
      _.forEach(_.map(data, 'invDt'), (value) => {
        months.push(DateHelper.getShortKoreanMonth(value));
      });
      _.forEach(_.map(data, 'totChargAmt'), (value) => {
        const item = parseInt(value, 10);
        totalCharge.push(item);
        useAv += item;
      });
      _.forEach(_.map(data, 'dcAdjAmt'), (value) => {
        const item = parseInt(value, 10);
        discountAdj.push(Math.abs(item));
        disAv += item;
      });
      result.months = months;
      result.useAverage = FormatHelper.numberWithCommas(Math.round(useAv / length)); // 평균사용금액
      result.disAverage = FormatHelper.numberWithCommas(Math.round(disAv / length)); // 평균할인금액
      result.chartFeeData = _.zip(months, totalCharge, discountAdj); // 날짜별 금액정보
    }
    return result;
  }

  convertPatternData(response): any {
    const result: any = {};
    if ( response.result && response.result.usageMonths ) {
      const data = response.result.usageMonths;
      const infos = _.map(data, 'bfuqdto');
      const iovInfos = _.map(data, 'inoutnetVideoUseVdto');
      const length = data.length;
      const voice: any = [];    // 기본
      const inVoice: any = [];  // 망내
      const outVoice: any = []; // 망외
      const vidVoice: any = []; // 영상
      const sms: any = [];      // 문자
      const cData: any = [];    // 데이터
      const months: any = [];   // 월
      let totalVoice = 0, totalSms = 0, totalcData = 0, inTotalVoice = 0, outTotalVoice = 0, vidTotalVoice = 0;
      _.forEach(_.map(data, 'invDtTemp'), (value) => {
        months.push(value + '월');
      });
      // 음성통화
      _.forEach(_.map(infos, 'domUseQty'), (value) => {
        totalVoice += parseInt(value, 10);
        voice.push(this.secToMS(value, 'B'));
      });
      // 문자
      _.forEach(_.map(infos, 'smsUseQty'), (value) => {
        totalSms += parseInt(value, 10);
        sms.push(parseInt(value, 10));
      });
      // 데이터
      _.forEach(_.map(infos, 'dataUseQty'), (value) => {
        totalcData += parseInt(value, 10);
        cData.push(this.convDataGB(value));
      });

      // 망내, 망외, 영상 음성통화
      _.forEach(iovInfos, (value) => {
        if (value) {
          const inItem = value['inNetVoiceCallUseQty'];
          const outItem = value['outNetVoiceCallUseQty'];
          const vidItem = value['videoCallUseQty'];
          // 망내
          inTotalVoice += parseInt(inItem, 10);
          inVoice.push(this.secToMS(inItem, 'B'));
          // 망외
          outTotalVoice += parseInt(outItem, 10);
          outVoice.push(this.secToMS(outItem, 'B'));
          // 영상
          vidTotalVoice += parseInt(vidItem, 10);
          vidVoice.push(this.secToMS(vidItem, 'B'));
        } else {
          inVoice.push('');
          outVoice.push('');
          vidVoice.push('');
        }
      });

      result.names = ['데이터', '음성통화', '문자'];
      result.totVoiceAverage = this.secToMS((totalVoice / length), 'A');               // 총 음성통화 평균
      result.totSmsAverage = Math.round(totalSms / length);                               // 총 문자 평균
      result.totCdataAverage = this.convDataGB(totalcData);                                  // 총 데이터 평균
      result.totInVoiceAverage = this.secToMS((inTotalVoice / length), 'A');           // 총 망내음성통화 평균
      result.totOutVoiceAverage = this.secToMS((outTotalVoice / length), 'A');         // 총 망외음성통화 평균
      result.totVidVoiceAverage = this.secToMS((vidTotalVoice / length), 'A');         // 총 영상통화 평균

      result.chartVoiceData = _.zip(months, voice);
      result.chartSmsData = _.zip(months, sms);
      result.chartCTData = _.zip(months, cData);
      result.chartInVoiceData = _.zip(months, inVoice);
      result.chartOutVoiceData = _.zip(months, outVoice);
      result.chartVidVoiceData = _.zip(months, vidVoice);
    }
    return result;
  }

  secToMS(seconds, type): any {
    const time = parseInt(seconds, 10);
    const h_min = (time / 3600) * 60;
    const min = Math.round(h_min + ((time % 3600) / 60));
    const sec = time % 60;

    if ( type === 'A' ) {
      return min + '분 ' + sec + '초';
    } else if ( type === 'B' ) {
      return min + ':' + sec;
    }
  }

  convDataGB(data): any {
    // 소수점 두번째 자리까지 표시가 필요하여 별도 구현 (GB)
    return (data / 1024 / 1024).toFixed(2);
  }
}

export default MytJSProtectChangeController;

