/**
 * FileName: myt-data.prepaid.history.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.11.20
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { PREPAID_PAYMENT_TYPE } from '../../../../types/bff.type';

const DEFAULT_PARAMS = {
  pageNum: 1,
  rowNum: 20
};

export default class MyTDataPrepaidHistory extends TwViewController {
  constructor() {
    super();
  }


  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.getVoiceRecharges(), this.getDataRecharges()).subscribe(([voice, data]) => {
      // const voice: any = this.getVoiceRecharges(),
      //   data: any = this.getDataRecharges();

      const visible = voice.histories.latest >= data.histories.latest ? 'voice' : 'data';
      delete voice.histories.latest;
      delete data.histories.latest;

      res.render('prepaid/myt-data.prepaid.history.html', { svcInfo, pageInfo, voice, data, visible });
    });
  }

  private getVoiceRecharges = () => {
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
        histories: resp.result.history.reduce(this.sortHistory, { latest: '' }),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  private getDataRecharges = () => {
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
        histories: resp.result.history.reduce(this.sortHistory, { latest: '' }),
        count: resp.result.totCnt,
        origin: resp.result.history
      };
    });
  }

  private sortHistory = (histories, history, idx) => {
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
