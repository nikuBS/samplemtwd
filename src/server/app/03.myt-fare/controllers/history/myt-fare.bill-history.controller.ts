/**
 * FileName: myt-fare.bill-history.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
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

class MyTFareBillHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    // this.logger.info(this, query.current, '----', svcInfo);

    if (query.current === 'tax' || query.current === 'cash') {

      if (query.current === 'tax') {
        this.apiService.request(API_CMD.BFF_07_0017, {}).subscribe((resp) => {

          resp = {
            code: '00',
            msg: 'success',
            result: {
              svcNum: '01044061324',
              selectMonth: {
                '201712': '2017년 12월',
                '201801': '2018년 01월',
                '201802': '2018년 02월',
                '201803': '2018년 03월',
                '201804': '2018년 04월',
                '201805': '2018년 05월',
                '201806': '2018년 06월'
              },
              selectQuarter: {
                '20174': '2017년 4분기',
                '20181': '2018년 1분기',
                '20182': '2018년 2분기'
              },
              selectHalf: {
                '20172': '2017년 하반기',
                '20181': '2018년 상반기'
              },
              splyPrcLong: 97600,
              vatAmtLong: 9760,
              totAmtLong: 107360,
              taxReprintList: [
                {
                  taxBillIsueDt: '20180310',
                  taxBillIsuNum: '000520645684',
                  ctzBizNum: '1160614738',
                  splyBizNum: '1048137225',
                  splyPrc: 48800,
                  vatAmt: 4880,
                  totAmt: 53680
                },
                {
                  taxBillIsueDt: '20180508',
                  taxBillIsuNum: '000523864955',
                  ctzBizNum: '1160614738',
                  splyBizNum: '1048137225',
                  splyPrc: 48800,
                  vatAmt: 4880,
                  totAmt: 53680
                }
              ]
            }
          };

          if (resp.code !== API_CODE.CODE_00) {
            return this.error.render(res, {
              code: resp.code,
              msg: resp.msg,
              svcInfo: svcInfo
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

          res.render('history/myt-fare.bill-history.html', {svcInfo: svcInfo, data: {
              isTax: query.current === 'tax',
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

          res.render('history/myt-fare.bill-history.html', {svcInfo: svcInfo, data: {
              isTax: query.current === 'tax',
              current: query.current,
              list: resp.result
            }});
        });
      }



    }
  }

}

export default MyTFareBillHistory;
