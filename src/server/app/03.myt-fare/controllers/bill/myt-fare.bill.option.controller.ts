/**
 * FileName: myt-fare.bill.option.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 * Description: 납부방법 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import {MYT_FARE_PAYMENT_TYPE, SVC_ATTR_NAME} from '../../../../types/bff.type';

class MyTFareBillOption extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getPaymentOption(), // 납부방법 조회
      this.getAddrInfo() // 주소 조회
    ).subscribe(([paymentOption, addrInfo]) => {
      if (paymentOption.code === API_CODE.CODE_00 && addrInfo.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.option.html', {
          svcInfo: this.getSvcInfo(svcInfo), // 회선 정보 (필수)
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
  }

  /* 납부방법 조회 */
  private getPaymentOption(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  /* 주소 조회 */
  private getAddrInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0146, {}).map((res) => {
      return res;
    });
  }

  /* 회선정보 조회 */
  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR_NAME[svcInfo.svcAttrCd]; // 서비스 코드로 서비스명 조회 (ex.모바일)
    svcInfo.phoneNum = StringHelper.phoneStringToDash(svcInfo.svcNum); // 휴대폰일 경우 '-' 추가

    return svcInfo;
  }

  /* 데이터 가공 */
  private parseData(data: any, svcInfo: any): any {
    if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK) { // 계좌이체 자동납부일 경우
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt); // 최초 승인예정일
      data.phoneNum = svcInfo.svcAttrCd.indexOf('M') === -1 ? StringHelper.phoneStringToDash(data.cntcNum)
        : svcInfo.phoneNum; // 모바일이면 '-' 추가
      data.isAuto = true;
    } else if (data.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD) { // 카드자동납부일 경우
      data.cardYm = FormatHelper.makeCardYymm(data.cardEffYm); // 유효기간 표시 포맷에 맞게 수정 (YYYY/MM)
      data.fstDrwSchdDate = FormatHelper.isEmpty(data.fstDrwSchdDt) ? '' : DateHelper.getShortDate(data.fstDrwSchdDt); // 승인예정일 YYYY.M.D.
      data.phoneNum = svcInfo.svcAttrCd.indexOf('M') === -1 ? StringHelper.phoneStringToDash(data.cntcNum)
        : svcInfo.phoneNum; // 모바일이면 '-'  추가
      data.isAuto = true;
    } else {
      data.isAuto = false;
    }
    return data;
  }

  private parseInfo(info: any): any {
    if (info.dispSvcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.dispSvcNum); // 휴대폰 번호에 '-' 추가
    }
    return info;
  }
}

export default MyTFareBillOption;
