/**
 * 5g 시간설정 내역
 * @author anklebreaker
 * @since 2019-04-15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {DATA_UNIT} from '../../../../types/string.type';
import {API_CMD} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import moment = require('moment');

/**
 * @class
 */
class MyTData5gSettingHistory extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 모바일 요금제 상품코드 */
  private readonly _prodIdList = ['NA00006402', 'NA00006403', 'NA00006404', 'NA00006405'];

  // @TODO api mockdata 확인 후 삭제
  private readonly mock84 = {
    'code': '00',
    'msg': 'success',
    'result': {
      'totUseTime': '135',
      'totConvtdData': '2024',
      'conversionHist': [{
        'rsvYn': 'N',
        'convStaDtm': '20190301100101',
        'convEndDtm': '20190301115959',
        'cnvtdData': '512',
        'cnvtdTime': '110',
        'rtndData': '0'
      }, {
        'rsvYn': 'Y',
        'convStaDtm': '20190301120101',
        'convEndDtm': '20190301135959',
        'cnvtdData': '1024',
        'cnvtdTime': '30',
        'rtndData': '20'
      }
        , {
          'rsvYn': 'Y',
          'convStaDtm': '20190303120101',
          'convEndDtm': '20190303135959',
          'cnvtdData': '2352',
          'cnvtdTime': '160',
          'rtndData': '436'
        }]
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
    const prodId = svcInfo.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo
      };

    if (this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    const brwsDt = req.query.brwsDt || moment().format('YYYYMM');

    this.apiService.request(API_CMD.BFF_06_0084, {brwsDt}).subscribe((historyInfo) => {
      // @TODO api mockdata 확인 후 삭제
      historyInfo = this.mock84;

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
          totUseTime: FormatHelper.convVoiceFormat(historyInfo.result.totUseTime * 60),
          totConvtdData: this.convDataFormat(historyInfo.result.totConvtdData),
        }
      });
    });
  }

  /**
   * @desc 예약내역 목록 변환
   * @param conversionHist
   */
  convHistoryList(conversionHist) {
    const result: Array<any> = [];
    conversionHist.forEach((item) => {
      const convStaDtm = moment(item.convStaDtm, 'YYYYMMDDhhmmss');
      const data = {
        rsvYn: item.rsvYn === 'Y' ? '예약' : '즉시',
        startTime: convStaDtm.format('hh:mm'),
        endTime: moment(item.convEndDtm, 'YYYYMMDDhhmmss').format('hh:mm'),
        cnvtdData: this.convDataFormat(item.cnvtdData),
        rtndData: item.rtndData > 0 ? this.convDataFormat(item.rtndData) : '',
      };
      const date = convStaDtm.format('YYYYMMDD');

      const histData = result.filter((histItem) => histItem.date === date)[0];
      if (histData) {
        histData.histList.push(data);
      } else {
        result.push({
          date,
          monthShortName: this.getMonthShortName(convStaDtm.toDate()),
          day: convStaDtm.format('DD'),
          histList: [data]
        });
      }
    });
    return result;
  }

  /**
   * @desc 검색옵션 현재로부터 세달전까지 YYYYMM
   */
  convSearchDate() {
    const searchDateList: Array<any> = [];
    const searchDate = moment();
    for (let i = 0; i < 3; i++) {
      searchDateList.push({
        text: searchDate.format('YYYY년 MM월'),
        value: searchDate.format('YYYYMM')
      });
      searchDate.subtract(1, 'months');
    }
    return searchDateList;
  }

  /**
   * @desc 데이터 포멧 변환
   * @param data
   */
  convDataFormat(data) {
    data = FormatHelper.convDataFormat(data, DATA_UNIT.MB);
    return FormatHelper.addComma(data.data) + data.unit;
  }

  /**
   * @desc get month short name
   * @param data
   */
  getMonthShortName(data) {
    data = new Date(data);
    return data.toLocaleString('en-us', {month: 'short'});
  }

}

export default MyTData5gSettingHistory;
