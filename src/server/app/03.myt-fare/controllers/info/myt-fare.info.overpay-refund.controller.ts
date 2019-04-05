/**
 * @file myt-fare.info.overpay-refund.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import {MYT_PAYMENT_HISTORY_REFUND_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';



class MyTFareInfoOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resp) => {
      
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }        

      resp.result.refundPaymentRecord = resp.result.refundPaymentRecord.reduce((prev, cur, index) => {
        
        cur.listId = index;
        cur.reqDt = DateHelper.getShortDate(cur.effStaDt); // 신청일자
        cur.dataDt = cur.rfndReqDt ? DateHelper.getShortDate(cur.rfndReqDt) : ''; // 처리날짜
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

      res.render('info/myt-fare.info.overpay-refund.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
          data: resp.result.refundPaymentRecord
      }});
    });
  }

}

export default MyTFareInfoOverpayRefund;
