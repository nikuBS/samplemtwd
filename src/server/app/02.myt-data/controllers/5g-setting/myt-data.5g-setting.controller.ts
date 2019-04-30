/**
 * 5g 시간설정
 * @author anklebreaker
 * @since 2019-04-15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {DATA_UNIT} from '../../../../types/string.type';
import moment = require('moment');

/**
 * @class
 */
class MyTData5gSetting extends TwViewController {
  constructor() {
    super();
  }

  /* 배너 부가서비스ID 목록 */
  private readonly _bannerIds = {
    POOQ: 'NA00006516',
    OKSUSU: 'NA00005876',
    FLO: 'NA00006520',
  };

  /* 접근이 허용되는 모바일 요금제 상품코드 */
  private readonly _prodIdList = ['NA00006402', 'NA00006403', 'NA00006404', 'NA00006405'];

  // @TODO api mockdata 확인 후 삭제
  private readonly mock78 = {
    code: '00',
    'msg': 'success',
    'result': [
      {
        'currUseYn': 'N',
        'rsvYn': 'Y',
        'convRgstDtm': '20190301100100',
        'convStaDtm': '20190301100100',
        'convEndDtm': '20190301103100',
        'cnvtdData': '1024',
        'cnvtdTime': '60',
        'remTime': '60'
      }
      // ,
      // {
      //   'currUseYn': 'N',
      //   'rsvYn': 'Y',
      //   'convRgstDtm': '20190301100100',
      //   'convStaDtm': '20190301110000',
      //   'convEndDtm': '20190301133000',
      //   'cnvtdData': '1024',
      //   'cnvtdTime': '60',
      //   'remTime': '60'
      // }
    ]
  };

  private readonly mock79 = {
    'code': '00',
    'msg': 'success',
    'result': {
      'brwsPsblYn': 'Y',
      'cnvtPsblYn': 'Y',
      'dataRemQty': '2323',
      'reqCnt': '1'
    }
  };

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

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0137, {}),
      this.apiService.request(API_CMD.BFF_06_0078, {}),
      this.apiService.request(API_CMD.BFF_06_0079, {}),
      this.apiService.request(API_CMD.BFF_06_0084, {brwsDt: DateHelper.getCurrentShortDate()})
    ).subscribe(([mobileaddInfo, conversionsInfo, dataInfo, historyInfo]) => {
      // @TODO api 확인 후 삭제
      conversionsInfo = this.mock78;
      dataInfo = this.mock79;

      const apiError = this.error.apiError([mobileaddInfo, conversionsInfo, dataInfo, historyInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      conversionsInfo.result.forEach((item) => {
        item.startTime = moment(item.convStaDtm, 'YYYYMMDDHHmmss').format('HH:mm');
        item.endTime = moment(item.convEndDtm, 'YYYYMMDDHHmmss').format('HH:mm');
      });
      const options = {
        ...renderCommonInfo,
        usingInfo: conversionsInfo.result.filter((item) => item.currUseYn === 'Y')[0] || {},
        reservationInfo: conversionsInfo.result.filter((item) => item.currUseYn === 'N')[0] || {},
        dataInfo: dataInfo.result,
        historyTotalCount: historyInfo.result.conversionHist.length,
        viewInfo: {
          bannerId: this.getBannerId(mobileaddInfo.result.addProdList),
          remainTime: this.convertHourMinFormat(Math.floor((dataInfo.result.dataRemQty - 170) / 17)),
          remainData: FormatHelper.convDataFormat(dataInfo.result.dataRemQty, DATA_UNIT.MB).data
        }
      };

      // 상태별 화면 분기
      if (dataInfo.result.dataRemQty < 170) {
        return res.render('5g-setting/myt-data.5g-setting.main.notenough.html', options); // 데이터 부족
      } else if (conversionsInfo.result.some((item) => item.currUseYn === 'Y')) {
        return res.render('5g-setting/myt-data.5g-setting.main.inuse.html', options); // 현재 이용중
      }
      return res.render('5g-setting/myt-data.5g-setting.main.html', options); // 기본 시간설정
    });
  }

  /**
   * @desc get remained time in korean
   * @param {number} target minutes
   * @returns {string} HH시간 mm분
   * @public
   */
  convertHourMinFormat(target: number) {
    const hour = Math.floor(target / 60);
    const min = target % 60;
    return (hour < 10 ? '0' + hour : hour) + '시간 ' + (min < 10 ? '0' + min : min) + '분';
  }

  /**
   * @desc get banner info
   * @param {array} 부가서바스 리스트
   * @returns {any} 배너ID
   * @public
   */
  getBannerId(addProdList) {
    const isJoinedPooq = addProdList.some((item) => item.prodId === this._bannerIds.POOQ);
    const isJoinedOksusu = addProdList.some((item) => item.prodId === this._bannerIds.OKSUSU);
    const isJoinedFlo = addProdList.some((item) => item.prodId === this._bannerIds.FLO);
    if (isJoinedPooq && isJoinedOksusu && isJoinedFlo) {
      // 7. 셋 다 가입인 경우 비노출
      return '';
    } else if (isJoinedPooq) {
      if (isJoinedOksusu) {
        // 5. 가,나 가입일 경우 C배너
        return this._bannerIds.FLO;
      }
      // 2. 가 만 가입일 경우 B베너
      // 6. 가,다 가입일 경우 B배너
      return this._bannerIds.OKSUSU;
    }
    // 1. 세상품 모두 가입 안되어있을 경우 A배너
    // 3. 나 만 가입일 경우 A배너
    // 4. 다 만 가입일 경우 A배너
    return this._bannerIds.POOQ;
  }
}

export default MyTData5gSetting;
