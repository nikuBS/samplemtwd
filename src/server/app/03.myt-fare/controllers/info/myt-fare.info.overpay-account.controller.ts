/**
 * @file [나의요금-과납내역_환불받기] 관련 처리
 * @author Lee Kirim
 * @since 2018-12-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


/**
 * 과납내역 환불받기 구현
 */
class MyTFareInfoOverpayAccount extends TwViewController {

  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
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
          totalOverAmt: FormatHelper.addComma(resp.result.rfndTotAmt.toString()), // 과납된 총 금액
          overPayList: resp.result.overPaymentRecord // 과납리스트
        }
      });

    });
  }

}

export default MyTFareInfoOverpayAccount;
