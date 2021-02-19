/**
 * @description: 나의 데이터/통화 > 최근 사용량 > 사용패턴
 * @file myt-data.usage.pattern.controller.ts
 * @author 김한수 (keiches@sptek.co.kr, skt.p148890@partner.sk.com)
 * @since 2019.10.07
 * @summary: 최근 사용에 대한 패턴 테이블 출력
 * @deprecated: client에서 구현하는 것으로 우선 진행
 */

import {NextFunction, Request, Response} from 'express';
import moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import {UNIT, DATA_UNIT, MYT_DATA_USAGE_PATTERN_DETAIL} from '../../../../types/string.type';
// import { UNIT, UNIT_E } from '../../../../types/bff.type';
import {VOICE_UNIT} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';

const WEEKDAYS_CAPTIONS = { 1: '일', 2: '월', 3: '화', 4: '수', 5: '목', 6: '금', 7: '토' };
const HOURS_CAPTIONS = { A: '00~06', B: '06~12', C: '12~18', D: '18~24' };
const TEMPLATE_FILE = 'usage/myt-data.usage.pattern.html';
const REPLACEMENT_STRING = '-';

const dataTimeToString = (value: { data: string | number, unit: string }) => (`${value.data}${value.unit}`);
const convDataFormat = (value: string | number) => (Number(value) >= 1 ? dataTimeToString(FormatHelper.convDataFormat(value, DATA_UNIT.KB)) :
    REPLACEMENT_STRING);
// const convVoiceMinsFormat = (value: string | number, includeSeconds?: boolean) => {
const convVoiceFormat = (value: string | number, includeSeconds?: boolean) => {
  const times = Number(value);
  if (times >= 1) {
    let formatted;
    const hours = ~~(times / 3600);
    if (hours) {
      formatted = `${hours}${VOICE_UNIT.HOURS}`;
    }
    const minutes = ~~((times % 3600) / 60);
    if (minutes) {
      formatted = `${formatted ? `${formatted} ` : '' }${minutes}${VOICE_UNIT.MIN}`;
    }
    if (includeSeconds) {
      const seconds = times % 60;
      if (seconds) {
        formatted = `${formatted ? `${formatted} ` : '' }${seconds}${VOICE_UNIT.SEC}`;
      }
    }
    if (formatted) {
      return formatted;
    }
  }
  return REPLACEMENT_STRING;
};
/*
const convVoiceFormat = (value: string | number) => (Number(value) >= 1 ? (FormatHelper.convVoiceFormatWithUnit(value)
    .reduce((acc, cur) => (`${acc ? `${acc} ` : ''}${dataTimeToString(cur)}`), '')) : REPLACEMENT_STRING);
*/
const convSMSFormat = (value: string | number) => (Number(value) >= 1 ? `${value.toString()}${UNIT.SMS}` : REPLACEMENT_STRING);

/**
 * @function
 * @desc 최근데이터사용량 월표시 (당해년 제외 년월로 표시)
 * @param {String} date
 * @returns {string}
 */
const DATE_FORMAT = 'YYYYMM';

const formatDate = function (date) {
  const yearToday = new Date().getFullYear();
  const yearInput = moment(date, DATE_FORMAT).toDate().getFullYear(); // DateHelper.convDateFormat(date).getFullYear();
  return DateHelper.getShortKoreanMonth(date, (yearToday !== yearInput));
};

class MyTDataUsagePattern extends TwViewController {
  /*
  // 추가 명령문이 없으면 구현할 필요없음
  constructor() {
    super();
  }
  */

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
        /**
         * 최근 사용량 정보조회
         * @private
         * return Observable
         */
        // http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=48595137
        this.apiService.request(API_CMD.BFF_05_0091, {}),
        /**
         * 최근 사용량 정보조회
         * @private
         * return Observable
         */
        // http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=99632558
        this.apiService.request(API_CMD.BFF_05_0213, {
          svcMgmtNum: svcInfo.svcMgmtNum
        })
    ).subscribe((responses) => {
      const apiError = this.error.apiError(responses);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.renderError(res, apiError, svcInfo, pageInfo);
      }

      // 월별로 데이터 테이블을 구성한다.
      const options: any = {
        pageInfo,
        svcInfo
      };
      options.svcInfo.svcNumDashed = FormatHelper.conTelFormatWithDash(svcInfo.svcNum);
      const respUsageByMonths = responses[0];
      // TODO: 함께 쓰기 회선과 같은 경우, 최근 사용량 정보가 없을 수 있으면 노출 안하도록해야 한다.
      // 종류별로 된 것을, 월별로 변경
      // 자료 없음
      if (respUsageByMonths.code !== 'BIL0070') {
        const byMonths = {};
        const dataUsages = (respUsageByMonths.result || {});
        // 음성 처리
        if (dataUsages.voice) {
          dataUsages.voice.forEach(item => {
            const pattern = byMonths[item.invMth] || {};
            byMonths[item.invMth] = pattern;
            /*
             * 단위: 초(sec)
             * item.totalUsage: 총 사용량
             * item.basOfrQty: 기본 제공량
             * item.basOfrUsage: 기본 제공량내 사용량
             * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
             */
            pattern.voice = {
              totalUsage: convVoiceFormat(item.totalUsage),
              basOfrQty: convVoiceFormat(item.basOfrQty),
              basOfrUsage: convVoiceFormat(item.basOfrUsage),
              // 망내
              inNetCallUsage: convVoiceFormat(item.inNetCallUsage, true),
              // 망외
              outNetCallUsage: convVoiceFormat(item.outNetCallUsage, true),
              // 영상통화
              videoCallUsage: convVoiceFormat(item.videoCallUsage, true)
            };
            /* XXX: 당장 사용하지 않음
            if (item.unlmtType === 2 && item.unlmtType === 3) {
              pattern.voice.unlimited = true;
            }
            */
          });
        }
        // 문자 처리
        if (dataUsages.sms) {
          dataUsages.sms.forEach(item => {
            const pattern = byMonths[item.invMth] || {};
            byMonths[item.invMth] = pattern;
            /*
             * 문자 단위: 건수
             * item.totalUsage: 총 사용량
             * item.basOfrQty: 기본 제공량
             * item.basOfrUsage: 기본 제공량내 사용량
             * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
             */
            pattern.sms = {
              totalUsage: convSMSFormat(item.totalUsage),
              basOfrQty: convSMSFormat(item.basOfrQty),
              basOfrUsage: convSMSFormat(item.basOfrUsage)
            };
            // 무제한 여부
            if (item.unlmtType === 2 && item.unlmtType === 3) {
              pattern.sms.unlimited = true;
            }
          });
        }
        // 데이터 처리
        if (dataUsages.data) {
          dataUsages.data.forEach(item => {
            const pattern = byMonths[item.invMth] || {};
            byMonths[item.invMth] = pattern;
            /*
             * 단위: KB
             * item.totalUsage: 총 사용량
             * item.basOfrQty: 기본 제공량
             * item.basOfrUsage: 기본 제공량내 사용량
             * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
             */
            pattern.data = {
              totalUsage: convDataFormat(item.totalUsage),
              basOfrQty: convDataFormat(item.basOfrQty),
              basOfrUsage: convDataFormat(item.basOfrUsage)
            };
            /* XXX: 당장 사용하지 않음
            if (item.unlmtType === 2 && item.unlmtType === 3) {
              pattern.data.unlimited = true;
            }
            */
          });
        }
        // 처음 선택된 탭 처리
        let indexTabSelected = -1;
        options.byMonths = Object.keys(byMonths).map((keyByMonth, index) => {
          const byMonth = byMonths[keyByMonth];
          const itemMonth: any = {
            caption: formatDate(keyByMonth)
          };
          if (byMonth.sms || byMonth.data || byMonth.voice) {
            // 자료가 있을때, 처음 선택되어 있을 탭 번호를 지정, 선택된 후에는 처리 안함
            if (indexTabSelected < 0) {
              indexTabSelected = index;
            }
            itemMonth.hasData = true;
            itemMonth.voice = byMonth.voice;
            itemMonth.sms = byMonth.sms;
            itemMonth.data = byMonth.data;
          }
          return itemMonth;
        });
        if (options.byMonths.length) {
          options.byMonths[indexTabSelected === -1 ? 0 : indexTabSelected].selected = true;
        }
      }
      // XXX: 기간에 대한 검증을 해야 하나?
      // responses[1].result.usePeriod[1] ~ responses[1].result.usePeriod[0] // [2]: 시작(1) ~ 끝(0)
      const dataPatterns = (responses[1].result || {});
      // 요일별 사용량정보 (3개월)
      // responses[1].result.usagePatternbyDayList; // [7]
      const patternsByWeekdays = dataPatterns.usagePatternbyDayList;
      if (patternsByWeekdays) {
        // 역순 정렬
        /*
        patternsByWeekdays.sort((weekday1, weekday2) => {
          // XXX: 아래과 같이 해야 일반적인 역순 정렬임 (1[일] ~ 7[월] 이므로)
          // return (weekday.num1 < weekday2.num) ? 1 : ((weekday1.num > weekday2.num) ? -1 : 0);
          // XXX: 같은 경우가 실제 발생하기 때문에, 0값 비교 처리 제거
          return (weekday1.num < weekday2.num) ? 1 : -1;
        });
        */
        // 표시 이름 만들기
        patternsByWeekdays.forEach(weekday => (weekday.caption = WEEKDAYS_CAPTIONS[weekday.num]));
        options.byWeekdays = patternsByWeekdays;
      }
      // 시간대별 사용량정보 (3개월)
      // responses[2].result.usagePatternbyTimeList; // [4]
      const patternsByTimes = dataPatterns.usagePatternbyTimeList;
      if (patternsByTimes) {
        // 정순 정렬
        patternsByTimes.sort((hour1, hour2) => {
          // XXX: 아래과 같이 해야 일반적인 정순 정렬임 (A[0~6] ~ D[18~24] 이므로)
          // return (hour1.num < hour2.num) ? -1 : ((hour1.num > hour2.num) ? 1 : 0);
          // XXX: 같은 경우가 실제 발생하기 때문에, 0값 비교 처리 제거
          return (hour1.num < hour2.num) ? -1 : 1;
        });
        // 표시 이름 만들기
        patternsByTimes.forEach(time => (time.caption = HOURS_CAPTIONS[time.num]));
        options.byTimes = patternsByTimes;
      }
      return res.render(TEMPLATE_FILE, options);
    }, (error) => {
      return this.renderError(res, error, svcInfo, pageInfo);
    });
  }

  private renderError(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_PATTERN_DETAIL.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }
}

export default MyTDataUsagePattern;
