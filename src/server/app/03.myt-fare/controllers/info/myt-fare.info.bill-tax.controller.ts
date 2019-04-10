/**
 * @file [나의요금-세금계산서발급내역_리스트] 관련 처리
 * @author Lee Kirim
 * @since 2018-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * 데이터로 전달될 세금발급내역 리스트 객체 형태 정의
 */
interface TaxList {
  listId: number;
  ctzBizName: string;
  taxBillIsueDt: string;
  splyPrc: string;
  vatAmt: string;
  totAmt: string;
}

/**
 * 팁정보 형태 정의
 */
interface TipInfo {
  [key: string]: string;
}

/**
 * 에러 반환값 정의
 */
interface ErrorInfo {
  code: string;
  msg: string;
}

/**
 * 세금계산서 발급내역 리스트 구현
 */
class MyTFareInfoBillTax extends TwViewController {
  /**
   * 각 api 조회시 에러반환 되면 저장하고 있다가 렌더단계에서 에러페이지 렌더링
   * @prop {ErrorInfo} returnErrorInfo 
   */
  private returnErrorInfo: ErrorInfo | any;

  constructor() {
    super();
    this.returnErrorInfo = {};
  }  
  

  render(_req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
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
          noticeInfo: this.getTipInfo() || []
        }});
      }
      
      
    });
  }

  

  /**
   * getBillTaxLists로부터 호출됨
   * @param {string} date
   * @param {any} svcInfo
   * @return {Observable<any | null>}
   */
  private getBillTaxList = (date: string, svcInfo: any): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'M', selSearch: date})
      .map((resp: {code: string, msg: string, result: any}) => {
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
  }

  

  /**
   * getBizTaxCnt로 부터 호출됨
   * date로 부터 monthPeriod 전의 데이터를 조회하는 Observable array 를 반환
   * @param {Date} date 
   * @param {number} monthPeriod 
   * @param {any} svcInfo
   * @return {Observable<any | null>[]}
   */
  private getBillTaxLists = (date: Date, monthPeriod: number, svcInfo: any): Observable<any | null>[] => {
    // monthPeriod 개월 전 구하기
    date.setDate(1);
    date.setMonth(date.getMonth() - monthPeriod);
    const list: Observable<any | null>[] = [];
    for ( let i = 0; i < monthPeriod; i++) {
      list.push(this.getBillTaxList(DateHelper.getCurrentShortDate(new Date(date)).substring(0, 6), svcInfo));
      date.setMonth(date.getMonth() + 1);
    }
    return list; 
  }

  /**
   * 세금계산발급내역 역순정렬 후 listId 추가 해 반환함
   * listId 는 상세내역조회에서 필요(팩스/이메일재발행 페이지) 했으나 상세조회에서 날짜로 조회하고 있음(현재는 사용하지 않음)
   * @param {array} taxlist 조회된 리스트 객체 {TaxList} 형태에서 listId 만 없는 상태
   */
  private mergeList = (taxlist: any[]): TaxList[] => {
    return [].concat.apply([], taxlist).reverse().map((tax, i) => {
      return Object.assign(tax, {listId: i});
    });
  }

  /**
   * @desc 꼭 확인해주세요 TIP 정리
   * @prop {string} link 팁 클래스
   * @prop {string} view 팁 아이디
   * @prop {srting} title 문구
   */
  private getTipInfo(): TipInfo[] {
    return [
      {link: 'MF_08_01_01_tip_01', view: 'MM000292', title: '세금계산서 적용안내'},
      {link: 'MF_08_01_01_tip_02', view: 'MM000292', title: '납세금계산서 내역 조회'},
      {link: 'MF_08_01_01_tip_03', view: 'MM000292', title: '세금계산서 합산 및 재발행'}
    ];
  }

}

export default MyTFareInfoBillTax;
