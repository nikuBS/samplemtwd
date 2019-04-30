/**
 * 5g 시간설정 예약
 * @author anklebreaker
 * @since 2019-04-15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {DATA_UNIT} from '../../../../types/string.type';
import {API_CMD} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import moment = require('moment');

/**
 * @class
 */
class MyTData5gSettingReservation extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 모바일 요금제 상품코드 */
  private readonly _prodIdList = ['NA00006402', 'NA00006403', 'NA00006404', 'NA00006405'];

  // @TODO api mockdata 확인 후 삭제
  private readonly mock79 = {
    'code': '00',
    'msg': 'success',
    'result': {
      'brwsPsblYn': 'Y',
      'cnvtPsblYn': 'Y',
      'dataRemQty': '1024',
      'reqCnt': '1'
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

    const current = moment();

    this.apiService.request(API_CMD.BFF_06_0079, {}).subscribe((dataInfo) => {
      // @TODO api mockdata 확인 후 삭제
      dataInfo = this.mock79;

      const apiError = this.error.apiError([dataInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('5g-setting/myt-data.5g-setting.reservation.html', {
        ...renderCommonInfo,
        isAndroid: BrowserHelper.isAndroid(req),
        dataInfo: {
          ...dataInfo.result,
          remainingData: this.convDataFormat(dataInfo.result.dataRemQty),
          today: current.format('YYYYMMDD'),
        },
        viewInfo: {
          date: current.format('MM월 DD일 (ddd)'),
          hour: current.add(10, 'minutes').format('hh'),
          min: current.format('mm'),
          ampm: current.format('a') === '오전' ? 0 : 1
        },
      });
    });
  }

  /**
   * @desc 데이터 포멧 변환
   * @param data
   */
  convDataFormat(data) {
    data = FormatHelper.convDataFormat(data, DATA_UNIT.MB);
    return FormatHelper.addComma(data.data) + data.unit;
  }
}

export default MyTData5gSettingReservation;
