/**
 * @file myt-fare.bill.sms.controller.ts
 * @author Jayoon Kong
 * @editor 양정규
 * @since 2018.09.18
 * @desc 요금납부 시 입금전용계좌 SMS 신청 page
 */

import {NextFunction, Request, Response} from 'express';
import {LINE_NAME, MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
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
      this.getAccountList(), // 자동납부 정보 조회
      this.getMobileList(pageInfo, allSvc)  // 모바일 회선 리스트
    ).subscribe(([unpaidList, accountList, mobileList]) => {
      if (unpaidList.code === API_CODE.CODE_00 || unpaidList.code === API_UNPAID_ERROR.BIL0016) {
        const isAllPaid = unpaidList.code === API_UNPAID_ERROR.BIL0016; // 미납정보가 없을 경우 회선정보 보여주지 않음

        res.render('bill/myt-fare.bill.sms.html', {
          isAllPaid: isAllPaid,
          unpaidList: isAllPaid ? [] : this.parseData(unpaidList.result, svcInfo, allSvc, pageInfo),
          virtualBankList: accountList, // 입금전용계좌 리스트
          title: MYT_FARE_PAYMENT_TITLE.SMS,
          svcInfo: this.getSvcInfo(svcInfo), // 회선정보 (필수 데이터)
          pageInfo: pageInfo, // 페이지정보 (필수 데이터)
          formatHelper: FormatHelper,
          mobileList
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

  /**
   * @desc 모바일 회선 반환(마스킹 해제 전이면 세션의 allSvc을 반환하며, 해제 후에는 재 호출하여 해제된 서비스 번호들을 반환한다.)
   * @param pageInfo
   * @param allSvc
   */
  private getMobileList(pageInfo: any, allSvc: any): Observable<any> {

    /**
     * @desc 핸드폰 번호 포맷팅
     * @param svcNumList
     */
    const parseTelFormat = (svcNumList: any[]) => {
      svcNumList.map((data) => {
        data.svcNum = FormatHelper.conTelFormatWithDash(data.svcNum);
      });
      return svcNumList;
    };

    // 마스킹 해제 전(allSvc 의 모바일 회선리스트를 반환한다.)
    if (!pageInfo.masking) {
      return Observable.create((observer) => {
        observer.next(parseTelFormat(allSvc.m) || []);
        observer.complete();
      });
    }

    // 마스킹 해제된 모바일 회선정보를 얻는다.
    return this.apiService.request(API_CMD.BFF_03_0030, {svcCtg: LINE_NAME.MOBILE}).map((res) => {
      return res.code === API_CODE.CODE_00 ? parseTelFormat(res.result.m) : [];
    });
  }
}

export default MyTFareBillSms;
