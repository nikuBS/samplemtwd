/*
 * FileName: myt-fare.submain.non-payment.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.01
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { PossibleDay, autopaySchedule_01, autopaySchedule_02, autopaySchedule_03 }
      from '../../../../mock/server/myt.fare.nonpaymt.mock';

class MyTFarePaymentOver extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data: any = {
      svcInfo: svcInfo
    };
    Observable.combineLatest(
      this._getNonPayment(),
      this._getPaymentPday(),
      this._getPaymentClaimDate(),
      this._getSuspension(),
      this._createMockPossibleDay(),
      this._createMockAutopaySd_01(),
      this._createMockAutopaySd_02(),
      this._createMockAutopaySd_03()
    ).subscribe(([nonpayment, possibleDay, claimDate, suspension, pd1, cm1, cm2, cm3]) => {
      if ( nonpayment ) {
        data.unPaidAmtList = nonpayment.unPaidAmtMonthInfoList;
        data.unPaidTotSum = FormatHelper.addComma(nonpayment.unPaidTotSum);
      }
      if ( possibleDay ) {
        data.possibleDay = possibleDay;
        data.suspStaDt = DateHelper.getShortKoreanMonth(possibleDay.suspStaDt);
      } else {
        // FIXME:납부가능일 관련 테스트계정확인 후 mock data 삭제
        data.possibleDay = pd1.result;
        data.suspStaDt = DateHelper.getShortKoreanMonth(pd1.result.suspStaDt);
      }
      if ( claimDate ) {
        data.claimDate = claimDate;
      } else {
        // FIXME:납부가능일 관련 테스트계정확인 후 mock data 삭제
        data.claimDate = cm2.result;
        data.claimDate2 = cm1.result;
        data.claimDate3 = cm3.result;
      }

      if ( suspension ) {
        data.suspension = suspension;
      }
      res.render('submain/myt-fare.submain.non-paymt.html', { data });
    });
  }

  // 미납요금내역
  _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.unPaidTotSum === '0' ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 납부가능일 조회
  _getPaymentPday() {
    return this.apiService.request(API_CMD.BFF_05_0031, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.useObjYn === 'Y' ) {
          return resp.result;
        } else {
          return null;
        }
      } else {
        // error
        return null;
      }
    });
  }

  // 납부가능일 청구일자 조회
  _getPaymentClaimDate() {
    return this.apiService.request(API_CMD.BFF_05_0033, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.autoPayHistoryList && resp.result.autoPayHistoryList.length > 0 ) {
          return resp.result;
        } else {
          return null;
        }
      } else {
        // error
        return null;
      }
    });
  }

  // 이용정지해제 정보 조회
  _getSuspension() {
    return this.apiService.request(API_CMD.BFF_05_0037, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.useObjYn === 'Y' ) {
          return resp.result;
        } else {
          return null;
        }
      } else {
        // error
        return null;
      }
    });
  }

  _createMockPossibleDay(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(PossibleDay);
      obs.complete();
    });
  }

  _createMockAutopaySd_01(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(autopaySchedule_01);
      obs.complete();
    });
  }

  _createMockAutopaySd_02(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(autopaySchedule_02);
      obs.complete();
    });
  }

  _createMockAutopaySd_03(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(autopaySchedule_03);
      obs.complete();
    });
  }
}

export default MyTFarePaymentOver;
