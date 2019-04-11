/**
 * @file myt-fare.bill.option.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.02
 * @desc 납부방법 조회 page
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import {MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';

/**
 * @class
 * @desc 납부방법 조회
 */
class MyTFareBillOption extends TwViewController {
  constructor() {
    super();
  }

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
    if (svcInfo.actRepYn === 'Y') {
      Observable.combineLatest(
        this.getPaymentOption(), // 납부방법 조회
        this.getAddrInfo() // 주소 조회
      ).subscribe(([paymentOption, addrInfo]) => {
        if (paymentOption.code === API_CODE.CODE_00 && addrInfo.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.option.html', {
            svcInfo: svcInfo, // 회선 정보 (필수)
            pageInfo: pageInfo, // 페이지 정보 (필수)
            paymentOption: this.parseData(paymentOption.result, svcInfo),
            addrInfo: this.parseInfo(addrInfo.result)
          });
        } else {
          this.error.render(res, {
            code: paymentOption.code === API_CODE.CODE_00 ? addrInfo.code : paymentOption.code,
            msg: paymentOption.code === API_CODE.CODE_00 ? addrInfo.msg : paymentOption.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('error.no-use.html', { svcInfo: svcInfo, pageInfo: pageInfo });
    }
  }

  /**
   * @function
   * @desc 납부방법 조회
   * @returns {Observable<any>}
   */
  private getPaymentOption(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  /**
   * @function
   * @desc 주소 조회
   * @returns {Observable<any>}
   */
  private getAddrInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0146, {}).map((res) => {
      return res;
    });
  }

  /**
   * @function
   * @desc parsing data
   * @param data
   * @param svcInfo
   * @returns {any}
   */
  private parseData(data: any, svcInfo: any): any {
    if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK) { // 계좌이체 자동납부일 경우
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt); // 최초 승인예정일
      data.phoneNum = FormatHelper.isEmpty(data.cntcNum) ? StringHelper.phoneStringToDash(svcInfo.svcNum)
        : StringHelper.phoneStringToDash(data.cntcNum); // 값이 있으면 cntcNum, 없으면 svcNum에 '-' 추가
      data.isAuto = true;
    } else if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD) { // 카드자동납부일 경우
      data.cardYm = FormatHelper.makeCardYymm(data.cardEffYm); // 유효기간 표시 포맷에 맞게 수정 (YYYY/MM)
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt); // 승인예정일 YYYY.M.D.
      data.phoneNum = FormatHelper.isEmpty(data.cntcNum) ? StringHelper.phoneStringToDash(svcInfo.svcNum)
        : StringHelper.phoneStringToDash(data.cntcNum); // 값이 있으면 cntcNum, 없으면 svcNum에 '-' 추가
      data.isAuto = true;
    } else {
      data.isAuto = false;
    }
    return data;
  }

  /**
   * @function
   * @desc parsing data
   * @param info
   * @returns {any}
   */
  private parseInfo(info: any): any {
    if (info.dispSvcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.dispSvcNum); // 휴대폰 번호에 '-' 추가
    }
    return info;
  }
}

export default MyTFareBillOption;
