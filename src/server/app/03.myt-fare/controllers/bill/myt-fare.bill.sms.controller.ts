/**
 * @file myt-fare.bill.sms.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.18
 * Description: 요금납부 시 입금전용계좌 SMS 신청
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE, SVC_ATTR_NAME, SVC_CD} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE, API_UNPAID_ERROR} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

class MyTFareBillSms extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getUnpaidList(), // 미납요금 대상자 조회
      this.getAccountList() // 자동납부 정보 조회
    ).subscribe(([unpaidList, accountList]) => {
      if (unpaidList.code === API_CODE.CODE_00 || unpaidList.code === API_UNPAID_ERROR.BIL0016) {
        const isAllPaid = unpaidList.code === API_UNPAID_ERROR.BIL0016; // 미납정보가 없을 경우 회선정보 보여주지 않음

        res.render('bill/myt-fare.bill.sms.html', {
          isAllPaid: isAllPaid,
          unpaidList: isAllPaid ? [] : this.parseData(unpaidList.result, svcInfo, allSvc),
          virtualBankList: accountList, // 입금전용계좌 리스트
          title: MYT_FARE_PAYMENT_TITLE.SMS,
          svcInfo: this.getSvcInfo(svcInfo), // 회선정보 (필수 데이터)
          pageInfo: pageInfo // 페이지정보 (필수 데이터)
        });
      } else {
        this.error.render(res, {
          code: unpaidList.code,
          msg: unpaidList.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  /* 미납요금 대상자 조회 */
  private getUnpaidList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0021, {}).map((res) => {
      return res;
    });
  }

  /* 입금전용계좌 정보 조회 */
  private getAccountList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0026, {}).map((res) => {
      let accountList = [];
      if (res.code === API_CODE.CODE_00) {
        if (!FormatHelper.isEmpty(res.result.virtualBankList)) {
          accountList = res.result.virtualBankList;
        }
      }
      return accountList;
    });
  }

  /* 데이터 정보 가공 */
  private parseData(result: any, svcInfo: any, allSvc: any): any {
    const list = result.settleUnPaidList; // 미납리스트
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.invDt = '';
      list.defaultIndex = 0;

      /* list 갯수만큼 loop */
      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.M.'); // 서버에서 내려오는 날짜를 YYYY.M. 포맷에 맞게 변경 */
        data.intMoney = this.removeZero(data.colAmt); // 금액 앞에 불필요하게 붙는 0 제거
        data.invMoney = FormatHelper.addComma(data.intMoney); // 금액에 콤마(,) 추가
        data.svcName = SVC_CD[data.svcCd]; // 서비스명 (모바일/인터넷...)
        data.svcNumber = data.svcCd === 'I' || data.svcCd === 'T' ? this.getAddr(data.svcMgmtNum, allSvc) :
          FormatHelper.conTelFormatWithDash(data.svcNum); // 서비스코드가 I나 T(인터넷/집전화 등)일 경우 주소 보여주고, M(모바일)일 경우 '-' 추가

        // 대표회선이고 청구날짜가 최근인 경우 가장 앞에 노출
        if (svcInfo.svcMgmtNum === data.svcMgmtNum && data.invDt > list.invDt) {
          list.invDt = data.invDt;
          list.defaultIndex = index;
        }
      });
    }
    return list;
  }

  /* 금액정보에서 앞자리 0 제거하는 method */
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

  private getSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcNumber = svcInfo.svcAttrCd === 'M1' ? FormatHelper.conTelFormatWithDash(svcInfo.svcNum) :
        svcInfo.svcNum; // 모바일인 경우 '-' 추가
    }
    return svcInfo;
  }

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

}

export default MyTFareBillSms;
