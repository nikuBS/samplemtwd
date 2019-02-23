/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.27
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';
import { API_ADD_SVC_ERROR, API_CMD, API_CODE, API_TAX_REPRINT_ERROR } from '../../../types/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../../types/title.type';
import { MYT_FARE_PAYMENT_ERROR } from '../../../types/string.type';
import { FARE_SUBMAIN_MOCK } from '../../../mock/server/test.submain.mock';

class TestMyTFareSubmainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isMicroPayment: false,
      isNotAutoPayment: true,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc)
    };
    if ( req && req.params.usagefee === 'usagefee' ) {
      // 사용요금
      data.type = 'UF';
      this._requestUsageFee(req, res, data, svcInfo, pageInfo);
    } else {
      // 청구요금
      this._requestClaim(req, res, data, svcInfo, pageInfo);
    }
  }

  /**
   * 청구요금
   * @param req :Request
   * @param res :Response
   * @param data :Object
   * @param svcInfo :Object
   * @private
   */
  _requestClaim(req, res, data, svcInfo, pageInfo) {
    Observable.combineLatest(
      this._getTypesFee(data.type),
      this._getNonPayment(),
      this._getPaymentInfo(),
      this._getTotalPayment(),
      this._getTaxInvoice(),
      this._getContribution(),
      this._getMicroPrepay(),
      this._getContentPrepay(),
      this._getRecentList(data.type),
      this._getRealTimePayment()
    ).subscribe(([claiminfo, nonpayment, paymentInfo, totalPayment,
                   taxInvoice, contribution, microPay, contentPay, recentList, realTime]) => {
      const claim: any = claiminfo.result;
      if ( claim.repSvcYn === 'N' ) {
        // 대표청구번호 아님
        claim.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.REP_SVC_N
        };
      }
      if ( claim.coClCd === 'B' ) {
        // 사업자 브로드밴드 경우
        claim.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.COM_CODE_B
        };
      }
      if ( claim.invDt.length === 0 ) {
        // no data
        claim.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.DEFAULT
        };
      }
      if ( claim.info ) {
        this.error.render(res, {
          title: MYT_FARE_SUBMAIN_TITLE.MAIN,
          code: claim.info.code,
          msg: claim.info.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      } else {
        // 소액결제
        if ( microPay ) {
          data.microPay = microPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( microPay.code !== API_ADD_SVC_ERROR.BIL0031 ) {
            data.isMicroPrepay = true;
          }
        }
        // 콘텐츠
        if ( contentPay ) {
          data.contentPay = contentPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( contentPay.code !== API_ADD_SVC_ERROR.BIL0031 ) {
            data.isContentPrepay = true;
          }
        }
        // 청구요금
        if ( claim ) {
          data.claim = claim;
          data.claimMonth = DateHelper.getShortKoreanAfterMonth(claim.invDt);
          // 사용요금
          const usedAmt = parseInt(claim.useAmtTot, 10);
          data.claimUseAmt = FormatHelper.addComma(usedAmt.toString());
          // 할인요금
          const disAmt = Math.abs(claim.deduckTotInvAmt);
          data.claimDisAmt = FormatHelper.addComma(disAmt.toString());
          // Total
          data.claimPay = FormatHelper.addComma(usedAmt.toString());
        }
        // 미납내역
        if ( nonpayment.result.unPaidTotSum !== '0' ) {
          data.nonpayment = nonpayment.result;
          data.unPaidTotSum = FormatHelper.addComma(nonpayment.result.unPaidTotSum);
        }
        // 납부/청구 정보
        if ( paymentInfo.result ) {
          data.paymentInfo = paymentInfo.result;
          // 자동납부인 경우
          if ( paymentInfo.result.payMthdCd === '01' || paymentInfo.result.payMthdCd === '02' || paymentInfo.result.payMthdCd === 'G1' ) {
            // 은행자동납부, 카드자동납부, 은행지로자동납부
            data.isNotAutoPayment = false;
          }
        }
        // 최근납부내역
        if ( totalPayment.result ) {
          data.totalPayment = totalPayment.result.paymentRecord;
        }
        // 세금계산서
        if ( taxInvoice.code === API_TAX_REPRINT_ERROR.BIL0018 ) {
          // 사업자 번호를 조회할 수 없는 상황
          taxInvoice = null;
        } else {
          data.taxInvoice = taxInvoice.result;
        }
        // 기부금/후원금
        if ( contribution.result ) {
          data.contribution = contribution.result;
        }
        data.recentList = recentList;
        data.realTime = realTime;
        res.render('test.myt-fare.submain.html', { data });
      }
    });
  }
  /**
   * 사용요금
   * @param req :Request
   * @param res :Response
   * @param data :Object
   * @param svcInfo :Object
   * @private
   */
  _requestUsageFee(req, res, data, svcInfo, pageInfo) {
    Observable.combineLatest(
      this._getTypesFee(data.type),
      this._getPaymentInfo(),
      this._getMicroPrepay(),
      this._getContentPrepay(),
      this._getRecentList(data.type),
      this._getRealTimePayment()
    ).subscribe(([usageinfo, paymentInfo, microPay, contentPay, recentList, realTime]) => {
      const usage: any = usageinfo.result;
      if ( usage.repSvcYn === 'N' ) {
        // 대표청구번호 아님
        usage.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.REP_SVC_N
        };
      }
      if ( usage.coClCd === 'B' ) {
        // 사업자 브로드밴드 경우
        usage.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.COM_CODE_B
        };
      }
      if ( usage.invDt.length === 0 ) {
        // no data
        usage.info = {
          code: '',
          msg: MYT_FARE_PAYMENT_ERROR.DEFAULT
        };
      }
      if ( usage.info ) {
        this.error.render(res, {
          title: MYT_FARE_SUBMAIN_TITLE.MAIN,
          code: usage.info.code,
          msg: usage.info.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      } else {
        // 사용요금
        if ( usage ) {
          data.usage = usage;
          data.useMonth = DateHelper.getShortKoreanAfterMonth(usage.invDt);
          // 사용요금
          const usedAmt = parseInt(usage.useAmtTot, 10);
          data.useAmtTot = FormatHelper.addComma(usedAmt.toString());
        }
        // 납부/청구 정보
        if ( paymentInfo ) {
          data.paymentInfo = paymentInfo.result;
          // 자동납부인 경우
          if ( paymentInfo.result.payMthdCd === '01' || paymentInfo.result.payMthdCd === '02' || paymentInfo.result.payMthdCd === 'G1' ) {
            // 은행자동납부, 카드자동납부, 은행지로자동납부
            data.isNotAutoPayment = false;
          }
        }
        // 소액결제
        if ( microPay ) {
          data.microPay = microPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( microPay.code !== API_ADD_SVC_ERROR.BIL0031) {
            data.isMicroPrepay = true;
          }
        }
        // 콘텐츠
        if ( contentPay ) {
          data.contentPay = contentPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( contentPay.code !== API_ADD_SVC_ERROR.BIL0031) {
            data.isContentPrepay = true;
          }
        }
        data.recentList = recentList;
        data.realTime = realTime;
        res.render('test.myt-fare.submain.html', { data });
      }
    });
  }

  convertOtherLines(target, items): any {
    // const MOBILE = items['M'] || [];
    // const OTHER = items['O'] || [];
    // const SPC = items['S'] || [];
    const list: any = [];
    // if ( MOBILE.length > 0 || OTHER.length > 0 || SPC.length > 0 ) {
    //   const nOthers: any = Object.assign([], MOBILE, OTHER, SPC);
    //   nOthers.filter((item) => {
    //     if ( target.svcMgmtNum !== item.svcMgmtNum ) {
    //       list.push(item);
    //     }
    //   });
    // }
    return list;
  }

  _getTypesFee(type): Observable<any> {
    if ( type === 'UF' ) {
      return Observable.create((obs) => {
        obs.next(FARE_SUBMAIN_MOCK.BFF_05_0047);
        obs.complete();
      });
    } else {
      return Observable.create((obs) => {
        obs.next(FARE_SUBMAIN_MOCK.BFF_05_0036);
        obs.complete();
      });
    }
  }

  _getNonPayment(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0030);
      obs.complete();
    });
  }

  _getPaymentInfo(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0058);
      obs.complete();
    });
  }

  _getTotalPayment(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_07_0030);
      obs.complete();
    });
  }

  _getTaxInvoice(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_07_0017);
      obs.complete();
    });
  }

  _getContribution(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0038);
      obs.complete();
    });
  }

  _getMicroPrepay(): Observable<any> {
    // 소액결제 확인
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0038);
      obs.complete();
    });
  }

  _getContentPrepay(): Observable<any> {
    // 콘텐츠이용 확인
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0038);
      obs.complete();
    });
  }

  _getRecentList(type): Observable<any> {
    if ( type === 'UF' ) {
      return Observable.create((obs) => {
        obs.next(FARE_SUBMAIN_MOCK.BFF_05_0021);
        obs.complete();
      });
    } else {
      return Observable.create((obs) => {
        obs.next(FARE_SUBMAIN_MOCK.BFF_05_0020);
        obs.complete();
      });
    }
  }

  _getRealTimePayment(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(FARE_SUBMAIN_MOCK.BFF_05_0022);
      obs.complete();
    });
  }
}

export default TestMyTFareSubmainController;
