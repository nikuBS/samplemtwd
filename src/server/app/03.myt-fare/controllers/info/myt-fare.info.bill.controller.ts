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
  current: string;
  isQueryEmpty: boolean;
}

class MyTFareInfoBill extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    // this.logger.info(this, query.current, '----', svcInfo);

    if (query.current === 'bill-tax' || query.current === 'bill-cash') {

      if (query.current === 'bill-tax') {
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

          res.render('info/myt-fare.info.bill.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
              isTax: query.current === 'bill-tax',
              current: query.current,
              items: resp.result.taxReprintList
            }});
        });
      } else {
        this.apiService.request(API_CMD.BFF_07_0004, {}).subscribe((resp) => {

          if (resp.code !== API_CODE.CODE_00) {
            return this.error.render(res, {
              code: resp.code,
              msg: resp.msg,
              svcInfo: svcInfo
              // ,pageInfo: pageInfo
            });
          }

          resp.result.map((o) => {
            o.dataDt = DateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD');
            o.dataAmt = FormatHelper.addComma(o.opAmt);
            o.sortDt = o.opDt;
            o.dataPhoneNumber = FormatHelper.conTelFormatWithDash(o.svcNum);
          });

          resp.result = resp.result.reduce((prev, cur, index) => {
            cur.listId = index;
            cur.listDt = cur.dataDt.slice(5);

            if (prev.length) {
              if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
                cur.yearHeader = cur.sortDt.slice(0, 4);
              }
            }

            prev.push(cur);

            return prev;
          }, []);

          res.render('info/myt-fare.info.bill.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
              isTax: query.current === 'bill-tax',
              current: query.current,
              list: resp.result
            }});
        });
      }



    }
  }

}

export default MyTFareInfoBill;
