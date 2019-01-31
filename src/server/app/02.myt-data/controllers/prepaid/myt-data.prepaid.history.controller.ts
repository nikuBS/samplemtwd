/**
 * FileName: myt-data.prepaid.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.20
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PREPAID_VOICE, PREPAID_DATA } from '../../../../mock/server/myt-data.prepaid.history.mock';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { PREPAID_PAYMENT_TYPE } from '../../../../types/bff.type';

export default class MyTDataPrepaidHistory extends TwViewController {
  private DEFAULT_PARAMS = {
    pageNum: 1,
    rowNum: 20
  };

  private recentDate = '';

  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.getVoiceRecharges(), this.getDataRecharges()).subscribe(([voice, data]) => {
      // const voice: any = this.getVoiceRecharges(),
      //   data: any = this.getDataRecharges();

      const error = {
        code: voice.code || data.code,
        msg: voice.msg || data.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          svcInfo
        });
      }

      res.render('prepaid/myt-data.prepaid.history.html', { svcInfo, pageInfo, voice, data, recentDate: this.recentDate });
    });
  }

  private getVoiceRecharges = () => {
    return this.apiService.request(API_CMD.BFF_06_0062, this.DEFAULT_PARAMS).map(resp => {
      // const resp = PREPAID_VOICE;
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        histories: resp.result.history.reduce(this.sortHistory, {}),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  private getDataRecharges = () => {
    return this.apiService.request(API_CMD.BFF_06_0063, this.DEFAULT_PARAMS).map(resp => {
      // const resp = PREPAID_DATA;
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        histories: resp.result.history.reduce(this.sortHistory, {}),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  private sortHistory = (histories, history, idx) => {
    const key = history.chargeDt;
    if (!histories[key]) {
      histories[key] = [];
    }

    this.recentDate = this.recentDate > key ? this.recentDate : key;

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
