/**
 * FileName: myt-fare.info.overpay-refund.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
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

class MyTFareInfoOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

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
          //  ,pageInfo: pageInfo
          });
        }        

        resData.result.refundPaymentRecord = resData.result.refundPaymentRecord.reduce((prev, cur, index) => {
          cur.listId = index;
          cur.reqDt = DateHelper.getShortDate(cur.effStaDt); // 신청일자
          cur.dataDt = cur.rfndReqDt ? DateHelper.getShortDate(cur.rfndReqDt) : ''; // 처리일자 
          cur.listDt = cur.dataDt.slice(5);
          cur.dataAmt = FormatHelper.addComma(cur.sumAmt);
          cur.dataOverAmt = FormatHelper.addComma(cur.ovrPay);
          cur.dataBondAmt = FormatHelper.addComma(cur.rfndObjAmt);
          cur.sortDt = cur.effStaDt;
          cur.dataStatus = MYT_PAYMENT_HISTORY_REFUND_TYPE[cur.rfndStat];

          if (prev.length) {
            if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
              cur.yearHeader = cur.sortDt.slice(0, 4);
            }
          }

          prev.push(cur);

          return prev;
        }, []);

        this.renderListView(res, svcInfo, pageInfo, query, resData.result.refundPaymentRecord);
      });

    } else if (query.current === 'detail') {
      this.renderDetailView(res, svcInfo, pageInfo, query);
    }
  }

  renderListView(res: Response, svcInfo: any, pageInfo: any, query: Query, data: any) {

    res.render('info/myt-fare.info.overpay-refund.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
        data: data
    }});
  }

  renderDetailView(res: Response, svcInfo: any, pageInfo: any, query: Query) {
    res.render('info/myt-fare.info.overpay-refund.detail.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {}});
  }

}

export default MyTFareInfoOverpayRefund;
