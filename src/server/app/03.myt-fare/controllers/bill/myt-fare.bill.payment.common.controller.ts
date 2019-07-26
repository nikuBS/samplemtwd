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
      list.isOnlyThisMon = true;  // 청구금액이 "당월"만 있는지 "당월+미납" 인지 여부. OP002-2797[입금전용계좌 문자신]만 사용

      // 이번달
      const thisMonth = DateHelper.getShortDateWithFormat(DateHelper.getCurrentDate(), 'YYYY-MM');
      // 미납금액 총액 임시저장. OP002-2797[입금전용계좌 문자신]만 사용
      let _tempSumUnpaid = 0;

      // list 갯수만큼 loop
      list.map((data) => {
        /*
          DV001-16851 청구월은 +1 해야함
          서버에서 내려오는 날짜를 YYYY년 M월 포맷에 맞게 변경
        */
        data.invYearMonth = DateHelper.getShortDateWithFormatAddByUnit(data.invDt, 1, 'months', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE);
        const _invDtFmt = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY-MM');
        // 현재 data 의 미납여부
        data.checked = data.isUnpaid = DateHelper.getDiffByUnit(_invDtFmt, thisMonth, 'month') < -1;
        data.intMoney = this.removeZero(data.colAmt); // 금액 앞에 불필요하게 붙는 0 제거 (VOC:OP002-1372. 무조건 미납금액'colAmt' 필드만사용. 청구금액도 이필드만 사용한다.)
        data.invMoney = FormatHelper.addComma(data.intMoney); // 금액에 콤마(,) 추가
        data.svcName = SVC_CD[data.svcCd]; // 서비스명 (모바일/인터넷...)
        data.svcNumber = data.svcCd === 'I' || data.svcCd === 'T' ? this.getAddr(data.svcMgmtNum, allSvc) :
          FormatHelper.conTelFormatWithDash(data.svcNum); // 서비스코드가 I나 T(인터넷/집전화 등)일 경우 주소 보여주고, M(모바일)일 경우 '-' 추가
        // 미납인경우, 미납액을 더해준다.
        list.sumUnpaid += parseInt(data.isUnpaid ? data.intMoney : 0, 10);
        _tempSumUnpaid += parseInt(data.intMoney, 10);
        // 1건 이라도 미납이 있으면 "당월요금만 존재" case 가 아님.
        if (list.isOnlyThisMon && data.isUnpaid) {
          list.isOnlyThisMon = false;
        }
        // 납부건수가 1건이면서, 당월 청구금액이면. [sumUnpaid] 에 당월 청구금액(invAmt), isUnpaid = true 설정한다.
        if (list.cnt === 1 && DateHelper.getDiffByUnit(_invDtFmt, thisMonth, 'month') === -1) {
          list.sumUnpaid = data.intMoney;
          data.checked = true;
        }
      });

      // 당월요금만 존재할 경우, 임시총액을 총 납부할 금액에 넣어준다.
      if (list.isOnlyThisMon) {
        list.sumUnpaid = _tempSumUnpaid;
      }
    }
    return list;
  }
}
