/**
 * @file myt-fare.bill.sms.controller.ts
 * @author Jayoon Kong
 * @editor 양정규
 * @since 2018.09.18
 * @desc 요금납부 시 입금전용계좌 SMS 신청 page
 */

import {NextFunction, Request, Response} from 'express';
import {MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE, API_UNPAID_ERROR} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import MyTFareBillPaymentCommon from './myt-fare.bill.payment.common.controller';

/**
 * @class
 * @desc 요금납부 시 입금전용계좌 SMS 신청
 */
class MyTFareBillSms extends MyTFareBillPaymentCommon {

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getUnpaidList(), // 미납요금 대상자 조회
      this.getAccountList() // 자동납부 정보 조회
    ).subscribe(([unpaidList, accountList]) => {
      if (unpaidList.code === API_CODE.CODE_00 || unpaidList.code === API_UNPAID_ERROR.BIL0016) {
        const isAllPaid = unpaidList.code === API_UNPAID_ERROR.BIL0016; // 미납정보가 없을 경우 회선정보 보여주지 않음

        res.render('bill/myt-fare.bill.sms.html', {
          isAllPaid: isAllPaid,
          unpaidList: isAllPaid ? [] : this.parseData(unpaidList.result, svcInfo, allSvc, pageInfo),
          virtualBankList: accountList, // 입금전용계좌 리스트
          title: MYT_FARE_PAYMENT_TITLE.SMS,
          svcInfo: this.getSvcInfo(svcInfo), // 회선정보 (필수 데이터)
          pageInfo: pageInfo, // 페이지정보 (필수 데이터)
          formatHelper: FormatHelper
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

  /**
   * @function
   * @desc 입금전용계좌 정보 조회
   * @returns {Observable<any>}
   */
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

  /**
   * @function
   * @desc get svc info (session info)
   * @param svcInfo
   * @returns {any}
   */
  private getSvcInfo(svcInfo: any): any {
    if (svcInfo) {
      svcInfo.svcNumber = svcInfo.svcAttrCd === 'M1' ? FormatHelper.conTelFormatWithDash(svcInfo.svcNum) :
        svcInfo.svcNum; // 모바일인 경우 '-' 추가
    }
    return svcInfo;
  }
}

export default MyTFareBillSms;
