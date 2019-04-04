/**
 * @file myt-fare.info.overpay-account.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.12.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import {MYT_PAYMENT_HISTORY_REFUND_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';



class MyTFareInfoOverpayAccount extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.overPaymentRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataAmt = FormatHelper.addComma(o.svcBamt);
      });

      res.render('info/myt-fare.info.overpay-account.html', {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        data: {
          totalOverAmt: FormatHelper.addComma(resp.result.rfndTotAmt.toString()),
          overPayList: resp.result.overPaymentRecord
        }
      });

    });
  }

}

export default MyTFareInfoOverpayAccount;
