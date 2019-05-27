/**
 * @file myt-fare.bill.payment.common.controller.ts
 * @author 양정규
 * @since 2019.05.27
 * @desc 요금즉시납부(계좌이체, 체크/신용카드, OK캐쉬백/T포인트, 입금전용계좌) 공통
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_BILL_GUIDE} from '../../../../types/string.type';
import {SVC_CD} from '../../../../types/bff.type';

export default abstract class MyTFareBillPaymentCommon extends TwViewController {

  constructor() {
    super();
  }

  /**
   * @function
   * @desc 금액정보에서 앞자리 0 제거하는 method
   * @param {string} input
   * @returns {string}
   */
  private removeZero(input: string): string {
    let isNotZero = false;
    for (let i = 0; i < input.length; i++) {
      if (!isNotZero) {
        if (input[i] !== '0') {
          input = input.substr(i, input.length - i);
          isNotZero = true;
        }
      }
    }
    return input;
  }

  /**
   * @function
   * @desc get address
   * @param svcMgmtNum
   * @param allSvc
   * @returns {any}
   */
  private getAddr(svcMgmtNum: any, allSvc: any): any {
    const serviceArray = allSvc.s; // 인터넷 회선
    let addr = '';

    serviceArray.map((data) => {
      if (data.svcMgmtNum === svcMgmtNum) {
        addr = data.addr; // 인터넷 회선 보유 시 주소 노출
      }
    });

    return addr;
  }

  /**
   * @function
   * @desc 미납요금 대상자 조회
   * @returns {Observable<any>}
   */
  protected getUnpaidList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0021, {});
  }

  /**
   * @function
   * @desc 데이터 정보 가공
   * @param result
   * @param svcInfo
   * @param allSvc
   * @returns {any}
   */
  protected parseData(result: any, svcInfo: any, allSvc: any): any {
    const list = result.settleUnPaidList; // 미납리스트
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.sumUnpaid = 0; // 미납금액 합계

      // 이번달
      const thisMonth = DateHelper.getShortDateWithFormat(DateHelper.getCurrentDate(), 'YYYY-MM');
      /* list 갯수만큼 loop */
      list.map((data) => {

        // DV001-16851 청구월은 +1 해야함
        // 서버에서 내려오는 날짜를 YYYY년 M월 포맷에 맞게 변경 /
        data.invYearMonth = DateHelper.getShortDateWithFormatAddByUnit(data.invDt, 1, 'months', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE);
        /**
         * OP002-127
         * 청구금액, 미납금액 구분
         * invDt == 지난달 은 "청구금액"을 가져오며, 지난달보다 더 과거이면 "미납금액"을 가져와야 함
         */
        const _invDtFmt = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY-MM');
        data.isUnpaid = DateHelper.getDiffByUnit(_invDtFmt, thisMonth, 'month') < -1;
        data.intMoney = this.removeZero(data.isUnpaid ? data.colAmt : data.invAmt); // 금액 앞에 불필요하게 붙는 0 제거 (청구금액과 미납금액 구분해준다.)
        data.invMoney = FormatHelper.addComma(data.intMoney); // 금액에 콤마(,) 추가
        data.svcName = SVC_CD[data.svcCd]; // 서비스명 (모바일/인터넷...)
        data.svcNumber = data.svcCd === 'I' || data.svcCd === 'T' ? this.getAddr(data.svcMgmtNum, allSvc) :
          FormatHelper.conTelFormatWithDash(data.svcNum); // 서비스코드가 I나 T(인터넷/집전화 등)일 경우 주소 보여주고, M(모바일)일 경우 '-' 추가
        list.sumUnpaid += parseInt(data.isUnpaid ? data.intMoney : 0, 10);
      });
    }
    return list;
  }
}
