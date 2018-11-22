/**
 * FileName: myt-fare.info.bill.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { isNull } from 'util';
import { runInThisContext } from 'vm';

interface Query {
  isQueryEmpty: boolean;
}

interface TaxList {
  listId: number;
  ctzBizName: string;
  taxBillIsueDt: string;
  splyPrc: string;
  vatAmt: string;
  totAmt: string;
}

class MyTFareInfoBillTax extends TwViewController {
  constructor() {
    super();
  }  

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query)
    };

    // 몇 달 전까지의 기록만 가능
    const monthPeriod = 10;
    // 더보기 구현 

    // 분기/반기로만 조회가 가능해 6번 호출
    Observable.combineLatest(
      this.getBillTaxLists(DateHelper.getCurrentDate(), monthPeriod, svcInfo)
    ).subscribe(taxlist => {
      res.render('info/myt-fare.info.bill-tax.html', {svcInfo, pageInfo, data: {
        limitMonth: monthPeriod,
        list: this.mergeList(taxlist)
      }});
    });
  }


  private getBillTaxList = (date: string, svcInfo: any): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'M', selSearch: date}).map((resp: {code: string, result: any}) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.taxReprintList.map((o) => {
        o.ctzBizName = svcInfo.eqpMdlNm;
        o.taxBillYearMonth = DateHelper.getYearMonth(o.taxBillIsueDt); // 발행시 구분자(selSearch)
        o.taxBillIsueDt = DateHelper.getShortDateWithFormat(o.taxBillIsueDt, 'YYYY.MM.DD');
        o.splyPrc = FormatHelper.addComma(o.splyPrc.toString());
        o.vatAmt = FormatHelper.addComma(o.vatAmt.toString());
        o.totAmt = FormatHelper.addComma(o.totAmt.toString());
      });

      return resp.result.taxReprintList;
    });
  }

  private getBillTaxLists = (date: Date, monthPeriod: number, svcInfo: any) => {
    // monthPeriod 개월 전 구하기
    date.setDate(1);
    date.setMonth(date.getMonth() - monthPeriod);
    const list: any[] = [];
    for ( let i = 0; i < monthPeriod; i++) {
      list.push(this.getBillTaxList(DateHelper.getYearMonth(new Date(date)), svcInfo));
      date.setMonth(date.getMonth() + 1);
    }
    return list; 
  }
  
  private mergeList = (taxlist): TaxList[] => {
    return [].concat.apply([], taxlist).map((tax, i) => {
      tax.listId = i;
      return tax;
    });
  }

}

export default MyTFareInfoBillTax;
