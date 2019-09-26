/**
 * 5g 시간설정 내역
 * @author anklebreaker
 * @since 2019-04-15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import {VOICE_UNIT} from '../../../../types/bff.type';

/**
 * @class
 */
class MyTData5gSettingHistory extends TwViewController {
  constructor() {
    super();
  }

  // @TODO api mockdata 확인 후 삭제
  private readonly mock84 = {
    'code': '00',
    'msg': 'success',
    'result': {
      'totUseTime': '135',
      'conversionHist': [
        {
        'convStaDtm': '20190301100101',
        'convEndDtm': '20190301215959',
        'cnvtdTime': '110',
        }, {
          'convStaDtm': '20190301120101',
          'convEndDtm': '20190301135959',
          'cnvtdTime': '30',
        }
        , {
          'convStaDtm': '20190303120101',
          'convEndDtm': '20190303135959',
          'cnvtdTime': '120',
        }, {
          'convStaDtm': '20190304120101',
          'convEndDtm': '20190304135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190305120101',
          'convEndDtm': '20190305135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190306120101',
          'convEndDtm': '20190306135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190307120101',
          'convEndDtm': '20190307135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190308120101',
          'convEndDtm': '20190308135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190309120101',
          'convEndDtm': '20190309135959',
          'cnvtdTime': '160',
        }, {
          'convStaDtm': '20190310120101',
          'convEndDtm': '20190310135959',
          'cnvtdTime': '160',
        }
      ]
    }
  };

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo
      };

    const brwsDt = req.query.brwsDt || moment().format('YYYYMM');

    this.apiService.request(API_CMD.BFF_06_0084, {brwsDt}).subscribe((historyInfo) => {
      // @TODO api mockdata 확인 후 삭제
      // historyInfo = this.mock84;

      const apiError = this.error.apiError([historyInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      const conversionHist = this.convHistoryList(historyInfo.result.conversionHist);
      const searchDateList = this.convSearchDate();

      res.render('5g-setting/myt-data.5g-setting.history.html', {
        ...renderCommonInfo,
        historyInfo: {
          brwsDt, conversionHist, searchDateList,
          totalCount: historyInfo.result.conversionHist.length,
          totUseTime: FormatHelper.convVoiceFormat(historyInfo.result.totUseTime * 60)
        }
      });
    });
  }

  /**
   * @desc 예약내역 목록 변환
   * @param conversionHist
   */
  private convHistoryList(conversionHist) {
    const convertTime = (time) => {
      let timeText = time.hours > 0 ? time.hours + VOICE_UNIT.HOURS : '';
      timeText += time.min > 0 ? ' ' + time.min + VOICE_UNIT.MIN : '';
      return timeText;
    };


    const result: Array<any> = [];
    conversionHist.forEach((item) => {
      const convStaDtm = moment(item.convStaDtm, 'YYYYMMDDHHmmss');
      const data = {
        usedTime: convertTime(FormatHelper.convVoiceFormat(item.cnvtdTime * 60)),
        startTime: convStaDtm.format('MM/DD HH:mm:ss'),  // 시작 시간
        endTime: moment(item.convEndDtm, 'YYYYMMDDHHmmss').format('MM/DD HH:mm:ss'), // 종료 시간
      };
      const date = convStaDtm.format('YYYYMMDD');

      const histData = result.filter((histItem) => histItem.date === date)[0];
      if (histData) {
        histData.histList.push(data);
      } else {
        result.push({
          date,
          useDate: DateHelper.getShortDateWithFormat(convStaDtm, 'MM.DD'),
          histList: [data]
        });
      }
    });
    return result;
  }

  /**
   * @desc 검색옵션 현재로부터 세달전까지 YYYYMM
   */
  private convSearchDate() {
    const searchDateList: Array<any> = [];
    const searchDate = moment();
    for (let i = 0; i < 3; i++) {
      searchDateList.push({
        text: searchDate.format('YYYY년 M월'),
        value: searchDate.format('YYYYMM')
      });
      searchDate.subtract(1, 'months');
    }
    return searchDateList;
  }
}

export default MyTData5gSettingHistory;
