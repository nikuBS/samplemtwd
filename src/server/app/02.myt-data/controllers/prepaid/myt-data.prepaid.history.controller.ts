/**
 * @file myt-data.prepaid.history.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.20
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { PREPAID_PAYMENT_TYPE } from '../../../../types/bff.type';

/**
 * @desc BFF api 페이징 기본 파라미터
 */
const DEFAULT_PARAMS = {
  pageNum: 1,
  rowNum: 20
};

export default class MyTDataPrepaidHistory extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 랜더링
   * @param  {Request} _req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this._getVoiceRecharges(), this._getDataRecharges()).subscribe(([voice, data]) => {
      // 음성 or 데이터 중 더 최신인 데이터 보여줌(BFF 요청 사항 - 전체 소팅 불가)
      const visible = voice.histories.latest >= data.histories.latest ? 'voice' : 'data';
      delete voice.histories.latest;
      delete data.histories.latest;

      res.render('prepaid/myt-data.prepaid.history.html', { svcInfo, pageInfo, voice, data, visible });
    });
  }

  /**
   * @desc 선불폰 음성 충전 내역 가져오기
   * @private
   */
  private _getVoiceRecharges = () => {
    return this.apiService.request(API_CMD.BFF_06_0062, DEFAULT_PARAMS).map(resp => {
      // const resp = PREPAID_VOICE;
      if (resp.code !== API_CODE.CODE_00) {
        return {
          histories: { latest: '' },
          count: 0,
          origin: []
        };
      }

      return {
        histories: resp.result.history.reduce(this._sortHistory, { latest: '' }),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  /**
   * @desc 선불폰 데이터 충전 내역 가져오기
   * @private
   */
  private _getDataRecharges = () => {
    return this.apiService.request(API_CMD.BFF_06_0063, DEFAULT_PARAMS).map(resp => {
      // const resp = PREPAID_DATA;
      if (resp.code !== API_CODE.CODE_00) {
        return {
          histories: { latest: '' },
          count: 0,
          origin: []
        };
      }

      return {
        histories: resp.result.history.reduce(this._sortHistory, { latest: '' }),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  /**
   * @desc 최근 충전 내역 순으로 소팅
   * @private
   */
  private _sortHistory = (histories, history, idx) => {
    let key = history.chargeDtm || history.chargeDt;

    histories.latest = key > histories.latest ? key : histories.latest;
    key = key.substring(0, 8);

    if (!histories[key]) {
      histories[key] = [];
    }

    histories[key].push({
      ...history,
      idx,
      date: DateHelper.getShortDate(key),
      amt: FormatHelper.addComma(history.amt),
      isCanceled: history.payCd === '5' || history.payCd === '9',
      cardNm: history.wayCd === '02' ? history.cardNm : PREPAID_PAYMENT_TYPE[history.wayCd]
    });

    return histories;
  }
}
