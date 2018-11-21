/**
 * FileName: myt-fare.info.bill.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  isQueryEmpty: boolean;
}

class MyTFareInfoBillTax extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query)
    };



    this.apiService.request(API_CMD.BFF_07_0017, {}).subscribe((resp) => {
      
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo,
          // ,pageInfo: pageInfo
        });
      }

      resp.result.taxReprintList.map((o, i) => {
        o.ctzBizName = svcInfo.eqpMdlNm;
        o.listId = i;
        o.taxBillIsueDt = DateHelper.getShortDateWithFormat(o.taxBillIsueDt, 'YYYY.MM.DD');
        o.splyPrc = FormatHelper.addComma(o.splyPrc.toString());
        o.vatAmt = FormatHelper.addComma(o.vatAmt.toString());
        o.totAmt = FormatHelper.addComma(o.totAmt.toString());
      });

      res.render('info/myt-fare.info.bill-tax.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
          items: resp.result.taxReprintList
        }});
    });
  }

}

export default MyTFareInfoBillTax;
