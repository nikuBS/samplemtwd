/**
 * FileName: myt.usage.pattern.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { USAGE_PATTERN_CHART, USAGE_PATTERN_NAME } from '../../../../types/string.old.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

class MyTUsagePattern extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let data = {
      svcInfo: svcInfo,
      isTotal: false,
      isPhone: true,
      names: USAGE_PATTERN_NAME
    };
    const curDate = new Date().getDate();
    const api = this.getPatternApi(svcInfo);
    let conf_data: any, conp_data: any;
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
          conf_data = this.convertFeeData(feeData);
        } else {
          conf_data = this.convertFeeData({
            result: {
              useAmtMonthInfos: []
            }
          });
        }
        data = Object.assign(data, conf_data);

        // 1~4일 인 경우
        if ( curDate < 5 ) {
          data.isTotal = true;
        } else {
          if ( patternData.code === API_CODE.CODE_00 ) {
            conp_data = this.convertPatternData(patternData);
            data = Object.assign(data, conp_data);
          } else {
            conp_data = this.convertPatternData({
              result: {
                usageMonths: []
              }
            });
          }
          data = Object.assign(data, conp_data);
        }

        const empty = this.checkEmptyData(data);
        data = Object.assign(data, empty);
        if ( data.svcInfo.svcAttrCd === 'M3' || data.svcInfo.svcAttrCd === 'M4' ) {
          data.isPhone = false;
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
      case 'M3':
      case 'M4':
        return [API_CMD.BFF_05_0059, API_CMD.BFF_05_0091];
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
      if ( length > 0 ) {
        const months: any = [];
        const totalCharge: any = [];
        const discountAdj: any = [];
        let useAv = 0;
        let disAv = 0;
        data.map((item) => item['invDt']).forEach((value) => {
          months.push(DateHelper.getShortKoreanMonth(value));
        });
        data.map((item) => item['totChargAmt']).forEach((value) => {
          const item = parseInt(value, 10);
          totalCharge.push(item);
          useAv += item;
        });
        data.map((item) => item['dcAdjAmt']).forEach((value) => {
          const item = parseInt(value, 10);
          discountAdj.push(Math.abs(item));
          disAv += item;
        });
        result.months = months;
        result.useAverage = (useAv && FormatHelper.numberWithCommas(Math.round(useAv / length))) || null; // 평균사용금액
        result.disAverage = (disAv && FormatHelper.numberWithCommas(Math.round(disAv / length))) || null; // 평균할인금액
        result.chartFeeData = FormatHelper.zip(months, totalCharge, discountAdj); // 날짜별 금액정보
      } else {
        result.months = [];
        result.useAverage = null;
        result.disAverage = null;
      }
    }
    return result;
  }

  convertPatternData(response): any {
    const result: any = {};
    if ( response.result && response.result.usageMonths ) {
      const data = response.result.usageMonths;
      if ( data.length > 0 ) {
        const infos = data.map((item) => item['bfuqdto']);
        const iovInfos = data.map((item) => item['inoutnetVideoUseVdto']);
        const length = data.length;
        const voice: any = [], inVoice: any = [], outVoice: any = [], vidVoice: any = [],
          sms: any = [], cData: any = [], months: any = [];
        let totalVoice = 0, totalSms = 0, totalcData = 0, inTotalVoice = 0, outTotalVoice = 0, vidTotalVoice = 0;
        data.map((item) => item['invDtTemp']).forEach((value) => {
          months.push(value + '월');
        });
        // 음성통화
        infos.map((item) => item['domUseQty']).forEach((value) => {
          if ( value ) {
            totalVoice += parseInt(value, 10);
            voice.push(this.secToMS(value, 'B'));
          } else {
            voice.push('00:00');
          }
        });
        // 문자
        infos.map((item) => item['smsUseQty']).forEach((value) => {
          totalSms += parseInt(value, 10);
          sms.push(parseInt(value, 10));
        });
        // 데이터
        infos.map((item) => item['dataUseQty']).forEach((value) => {
          totalcData += parseInt(value, 10);
          cData.push(this.convDataGB(value));
        });

        // 망내, 망외, 영상 음성통화
        iovInfos.forEach((value) => {
          if ( value ) {
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
            inVoice.push('00:00');
            outVoice.push('00:00');
            vidVoice.push('00:00');
          }
        });

        result.totVoiceAverage = (totalVoice && this.secToMS((totalVoice / length), 'A')) || null; // 음성통화 평균
        result.totSmsAverage = (totalSms && Math.round(totalSms / length)) || null; // 문자 평균
        result.totCdataAverage = (totalcData && this.convDataGB(totalcData / length)) || null; // 데이터 평균
        result.totInVoiceAverage = (inTotalVoice && this.secToMS((inTotalVoice / length), 'A')) || null; // 망내음성통화 평균
        result.totOutVoiceAverage = (outTotalVoice && this.secToMS((outTotalVoice / length), 'A')) || null; // 망외음성통화 평균
        result.totVidVoiceAverage = (vidTotalVoice && this.secToMS((vidTotalVoice / length), 'A')) || null; // 영상통화 평균

        result.chartVoiceData = FormatHelper.zip(months, voice);
        result.chartSmsData = FormatHelper.zip(months, sms);
        result.chartCTData = FormatHelper.zip(months, cData);
        result.chartInVoiceData = FormatHelper.zip(months, inVoice);
        result.chartOutVoiceData = FormatHelper.zip(months, outVoice);
        result.chartVidVoiceData = FormatHelper.zip(months, vidVoice);
      } else {
        result.totVoiceAverage = null; // 음성통화 평균
        result.totSmsAverage = null; // 문자 평균
        result.totCdataAverage = null; // 데이터 평균
        result.totInVoiceAverage = null; // 망내음성통화 평균
        result.totOutVoiceAverage = null; // 망외음성통화 평균
        result.totVidVoiceAverage = null; // 영상통화 평균
      }
    }
    return result;
  }

  checkEmptyData(data): any {
    const result: any = {};
    result.empty = {
      fee: !data.useAverage,
      voice: !data.totVoiceAverage,
      sms: !data.totSmsAverage,
      cdata: !data.totCdataAverage,
      inVoice: !data.totInVoiceAverage,
      outVoice: !data.totOutVoiceAverage,
      vidVoice: !data.totVidVoiceAverage
    };
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

export default MyTUsagePattern;

