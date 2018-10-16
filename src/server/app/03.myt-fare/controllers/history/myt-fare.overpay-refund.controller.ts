/**
 * FileName: myt-fare.overpay-refund.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import {MYT_PAYMENT_HISTORY_REFUND_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class MyTFareOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    if (query.current === 'overpay-refund') {
      this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resData) => {

        if (resData.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            code: resData.code,
            msg: resData.msg,
            svcInfo: svcInfo
          });
        }

        resData.result.refundPaymentRecord = resData.result.refundPaymentRecord.reduce((prev, cur, index) => {
          cur.listId = index;
          cur.dataDt = DateHelper.getShortDateWithFormat(cur.rfndReqDt, 'YYYY.MM.DD');
          cur.listDt = cur.dataDt.slice(5);
          cur.dataAmt = FormatHelper.addComma(cur.sumAmt);
          cur.dataOverAmt = FormatHelper.addComma(cur.ovrPay);
          cur.dataBondAmt = FormatHelper.addComma(cur.rfndObjAmt);
          cur.sortDt = cur.rfndReqDt;
          cur.dataStatus = MYT_PAYMENT_HISTORY_REFUND_TYPE[cur.rfndStat];

          if (prev.length) {
            if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
              cur.yearHeader = cur.sortDt.slice(0, 4);
            }
          }

          prev.push(cur);

          return prev;
        }, []);

        this.renderListView(res, svcInfo, query, resData.result.refundPaymentRecord);
      });

    } else if (query.current === 'detail') {
      this.renderDetailView(res, svcInfo, query);
    }
  }

  renderListView(res: Response, svcInfo: any, query: Query, data: any) {

    res.render('history/myt-fare.overpay-refund.history.html', {svcInfo: svcInfo, data: {
      current: query.current,
        data: data
    }});
  }

  renderDetailView(res: Response, svcInfo: any, query: Query) {

    res.render('history/myt-fare.overpay-refund.history.detail.html', {svcInfo: svcInfo, data: {
        current: query.current
      }});
  }

}

export default MyTFareOverpayRefund;
