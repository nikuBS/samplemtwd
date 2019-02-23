/**
 * FileName: myt-fare.info.overpay-refund.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.6
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import {MYT_PAYMENT_HISTORY_REFUND_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_PAYMENT_DETAIL_ERROR } from '../../../../types/string.type';

class MyTFareInfoOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {


    const listId = req.query.listId; 

    if (!FormatHelper.isEmpty(listId)) {

      this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resp) => {
        
        if (resp.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }

        const resultData = resp.result.refundPaymentRecord[listId];

        if (!resultData || !listId) {
          return this._renderError(null, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
        }

        resultData.reqDt = DateHelper.getShortDate(resultData.effStaDt); // 신청일자
        resultData.dataDt = resultData.rfndReqDt ? DateHelper.getShortDate(resultData.rfndReqDt) : ''; // 처리일자 
        resultData.dataAmt = FormatHelper.addComma(resultData.sumAmt); // 신청금액 / 합계 금액
        resultData.dataOverAmt = FormatHelper.addComma(resultData.ovrPay); // 과납금액
        resultData.dataBondAmt = FormatHelper.addComma(resultData.rfndObjAmt); // 채권보존료
        resultData.dataStatus = MYT_PAYMENT_HISTORY_REFUND_TYPE[resultData.rfndStat]; // 처리결과
        resultData.inProcess = resultData.rfndStat === 'ING'; // 처리중 여부

        res.render('info/myt-fare.info.overpay-refund.detail.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: resultData});

      });

    } else {
      return this._renderError(null, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
    }
  }

  // 오류 페이지
  private _renderError(code, msg, res, svcInfo, pageInfo) {
    return this.error.render(res, {
      code,
      msg,
      pageInfo,
      svcInfo
    });
  }
}

export default MyTFareInfoOverpayRefund;
