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
import { AutoPaySd_01, AutoPaySd_02, AutoPaySd_03, PaySuspension, PossibleDay, UnbillInfo } from '../../../../mock/server/myt.fare.nonpaymt.mock';

class TestMyTFarePaymentOver extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };
    Observable.combineLatest(
      this._createMockUnbill(),
      this._createMockPossibleDay(),
      this._createMockAutopaySd_01(),
      this._createMockAutopaySd_02(),
      this._createMockAutopaySd_03(),
      this._createMockSuspension()
    ).subscribe(([nonpayment, pd1, cm1, cm2, cm3, sp1]) => {
      // FIXME: TEST 용 mock data
      data.unPaidAmtList = nonpayment.result.unPaidAmtMonthInfoList;
      data.unPaidTotSum = FormatHelper.addComma(nonpayment.result.unPaidTotSum);
      data.possibleDay = pd1.result;
      data.suspStaDt = DateHelper.getShortKoreanMonth(pd1.result.suspStaDt);
      data.claimDate = cm2.result;
      data.claimDate2 = cm1.result;
      data.claimDate3 = cm3.result;
      data.suspension = sp1.result;
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

  _createMockUnbill(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(UnbillInfo);
      obs.complete();
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
      obs.next(AutoPaySd_01);
      obs.complete();
    });
  }

  _createMockAutopaySd_02(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(AutoPaySd_02);
      obs.complete();
    });
  }

  _createMockAutopaySd_03(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(AutoPaySd_03);
      obs.complete();
    });
  }

  _createMockSuspension(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(PaySuspension);
      obs.complete();
    });
  }
}

export default TestMyTFarePaymentOver;
