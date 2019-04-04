/**
 * @file myt-fare.info.bill.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.09.17
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
import { BoundCallbackObservable } from 'rxjs/observable/BoundCallbackObservable';

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
interface Info {
  [key: string]: string;
}
interface ErrorInfo {
  code: string;
  msg: string;
}
class MyTFareInfoBillTax extends TwViewController {
  private returnErrorInfo: ErrorInfo | any;

  constructor() {
    super();
    this.returnErrorInfo = {};
  }  
  

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query)
    };

    // 몇 달 전까지의 기록만 가능(6)
    const monthPeriod = 6;
    // 더보기 구현 

    // 분기/반기로만 조회가 가능해 6번 호출
    Observable.combineLatest(
      this.getBillTaxLists(DateHelper.getCurrentDate(), monthPeriod, svcInfo)
    ).subscribe(taxlist => {      
      if (this.returnErrorInfo.code) {
        this.error.render(res, {
          code: this.returnErrorInfo.code,
          msg: this.returnErrorInfo.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      } else {
        res.render('info/myt-fare.info.bill-tax.html', {svcInfo, pageInfo, data: {
          limitMonth: monthPeriod,
          items: this.mergeList(taxlist),
          noticeInfo: this.getNoticeInfo() || []
        }});
      }
      
      
    });
  }

  

  private getBillTaxList = (date: string, svcInfo: any): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'M', selSearch: date}).map((resp: {code: string, msg: string, result: any}) => {
      if (resp.code !== API_CODE.CODE_00) {
        // 처음발생한 코드를 우선적으로 저장
        if (!this.returnErrorInfo.code) {
          this.returnErrorInfo = {
            code: resp.code,
            msg: resp.msg
          };
        }
        return null;
      }


      resp.result.taxReprintList.map((o) => {
        o.ctzBizName = svcInfo.eqpMdlNm;
        // 발행시 구분자(selSearch) YYYYMM API 호출시 YYYYM 형태는 인지 못함 2018.12
        o.taxBillYearMonth = DateHelper.getCurrentShortDate(o.taxBillIsueDt).substring(0, 6);         
        o.taxBillIsueDt = DateHelper.getShortDate(o.taxBillIsueDt);
        o.splyPrc = FormatHelper.addComma(o.splyPrc.toString());
        o.vatAmt = FormatHelper.addComma(o.vatAmt.toString());
        o.totAmt = FormatHelper.addComma(o.totAmt.toString());
      });

      return resp.result.taxReprintList;
    });
  };

  

  private getBillTaxLists = (date: Date, monthPeriod: number, svcInfo: any) => {
    // monthPeriod 개월 전 구하기
    date.setDate(1);
    date.setMonth(date.getMonth() - monthPeriod);
    const list: any[] = [];
    for ( let i = 0; i < monthPeriod; i++) {
      list.push(this.getBillTaxList(DateHelper.getCurrentShortDate(new Date(date)).substring(0, 6), svcInfo));
      date.setMonth(date.getMonth() + 1);
    }
    return list; 
  };
  
  private mergeList = (taxlist): TaxList[] => {
    return [].concat.apply([], taxlist).reverse().map((tax, i) => {
      return Object.assign(tax, {listId: i});
    });
  };

  // 꼭 확인해 주세요 팁 메뉴 정리
  private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_08_01_01_tip_01', view: 'MM000292', title: '세금계산서 적용안내'},
      {link: 'MF_08_01_01_tip_02', view: 'MM000292', title: '납세금계산서 내역 조회'},
      {link: 'MF_08_01_01_tip_03', view: 'MM000292', title: '세금계산서 합산 및 재발행'}
    ];
  }

}

export default MyTFareInfoBillTax;
