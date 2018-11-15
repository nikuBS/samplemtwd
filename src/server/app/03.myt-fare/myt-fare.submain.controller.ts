/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.27
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import { API_ADD_SVC_ERROR, API_CMD, API_CODE, API_TAX_REPRINT_ERROR } from '../../types/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../types/title.type';
import { MYT_FARE_PAYMENT_ERROR } from '../../types/string.type';

class MyTFareSubmainController extends TwViewController {
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
    if ( req && req.params.usagefee === 'usagefee') {
      // 사용요금
      data.type = 'UF';
      this._requestUsageFee(req, res, data, svcInfo);
    } else {
      // 청구요금
      this._requestClaim(req, res, data, svcInfo);
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
  _requestClaim(req, res, data, svcInfo) {
    Observable.combineLatest(
      this._getTypesFee(data.type),
      this._getNonPayment(),
      this._getPaymentInfo(),
      this._getTotalPayment(),
      this._getTaxInvoice(),
      this._getContribution(),
      this._getMicroPrepay(),
      this._getContentPrepay()
    ).subscribe(([claim, nonpayment, paymentInfo, totalPayment,
                   taxInvoice, contribution, microPay, contentPay]) => {
      if ( claim.info ) {
        this.error.render(res, {
          title: MYT_FARE_SUBMAIN_TITLE.MAIN,
          code: claim.info.code,
          msg: claim.info.msg,
          svcInfo: svcInfo
        });
      } else {
        // 소액결제
        if ( microPay ) {
          data.microPay = microPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.microPay.code !== API_ADD_SVC_ERROR.BIL0031 && svcInfo.svcAttrCd === 'M1' ) {
            data.isMicroPrepay = true;
          }
        }
        // 콘텐츠
        if ( contentPay ) {
          data.contentPay = contentPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.contentPay.code !== API_ADD_SVC_ERROR.BIL0031 && svcInfo.svcAttrCd === 'M1' ) {
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
        if ( nonpayment ) {
          data.nonpayment = nonpayment;
          data.unPaidTotSum = FormatHelper.addComma(nonpayment.unPaidTotSum);
        }
        // 납부/청구 정보
        if ( paymentInfo ) {
          data.paymentInfo = paymentInfo;
          // 자동납부인 경우
          if ( paymentInfo.payMthdCd === '01' || paymentInfo.payMthdCd === '02' || paymentInfo.payMthdCd === 'G1' ) {
            // 은행자동납부, 카드자동납부, 은행지로자동납부
            data.isNotAutoPayment = false;
          }
        }
        // 최근납부내역
        if ( totalPayment ) {
          data.totalPayment = totalPayment.paymentRecord;
        }
        // 세금계산서
        if ( taxInvoice ) {
          data.taxInvoice = taxInvoice;
        }
        // 기부금/후원금
        if ( contribution ) {
          data.contribution = contribution;
        }

        res.render('myt-fare.submain.html', { data });
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
  _requestUsageFee(req, res, data, svcInfo) {
    Observable.combineLatest(
      this._getTypesFee(data.type),
      this._getPaymentInfo(),
      this._getMicroPrepay(),
      this._getContentPrepay()
    ).subscribe(([usage, paymentInfo, microPay, contentPay]) => {
      if ( usage.info ) {
        this.error.render(res, {
          title: MYT_FARE_SUBMAIN_TITLE.MAIN,
          code: usage.info.code,
          msg: usage.info.msg,
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
          data.paymentInfo = paymentInfo;
          // 자동납부인 경우
          if ( paymentInfo.payMthdCd === '01' || paymentInfo.payMthdCd === '02' || paymentInfo.payMthdCd === 'G1' ) {
            // 은행자동납부, 카드자동납부, 은행지로자동납부
            data.isNotAutoPayment = false;
          }
        }
        // 소액결제
        if ( microPay ) {
          data.microPay = microPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.microPay.code !== API_ADD_SVC_ERROR.BIL0031 && svcInfo.svcAttrCd === 'M1' ) {
            data.isMicroPrepay = true;
          }
        }
        // 콘텐츠
        if ( contentPay ) {
          data.contentPay = contentPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.contentPay.code !== API_ADD_SVC_ERROR.BIL0031 && svcInfo.svcAttrCd === 'M1' ) {
            data.isContentPrepay = true;
          }
        }

        res.render('myt-fare.submain.html', { data });
      }
    });
  }

  convertOtherLines(target, items): any {
    const MOBILE = items['M'] || [];
    const OTHER = items['O'] || [];
    const SPC = items['S'] || [];
    const list: any = [];
    if ( MOBILE.length > 0 || OTHER.length > 0 || SPC.length > 0 ) {
      const nOthers: any = Object.assign([], MOBILE, OTHER, SPC);
      nOthers.filter((item) => {
        if ( target.svcMgmtNum !== item.svcMgmtNum ) {
          list.push(item);
        }
      });
    }
    return list;
  }

  _getTypesFee(type) {
    let API_URL = API_CMD.BFF_05_0036;
    if ( type === 'UF' ) {
      API_URL = API_CMD.BFF_05_0047;
    }
    return this.apiService.request(API_URL, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const result = resp.result;
        if ( result.repSvcYn === 'N' ) {
          // 대표청구번호 아님
          return {
            info: {
              code: '',
              msg: MYT_FARE_PAYMENT_ERROR.REP_SVC_N
            }
          };
        }
        if ( result.coClCd === 'B' ) {
          // 사업자 브로드밴드 경우
          return {
            info: {
              code: '',
              msg: MYT_FARE_PAYMENT_ERROR.COM_CODE_B
            }
          };
        }
        if ( resp.result.invDt.length === 0 ) {
          // no data
          return {
            info: {
              code: '',
              msg: MYT_FARE_PAYMENT_ERROR.DEFAULT
            }
          };
        }
        return resp.result;
      } else {
        return {
          info: resp
        };
      }
    });
  }

  _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.unPaidTotSum === '0' ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0058, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getTotalPayment() {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.paymentRecord.length === 0 ) {
          return null;
        }
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getTaxInvoice() {
    return this.apiService.request(API_CMD.BFF_07_0017, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else if ( resp.code === API_TAX_REPRINT_ERROR.BIL0018 ) {
        // 사업자 번호를 조회할 수 없는 상황
        return null;
      } else {
        return null;
      }
    });

  }

  _getContribution() {
    return this.apiService.request(API_CMD.BFF_07_0038, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getMicroPrepay() {
    // 소액결제 확인
    return this.apiService.request(API_CMD.BFF_07_0072, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        resp.result.code = API_CODE.CODE_00;
        return resp.result;
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0030 ) {
        return { code: API_ADD_SVC_ERROR.BIL0030 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0031 ) {
        return { code: API_ADD_SVC_ERROR.BIL0031 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0033 ) {
        return { code: API_ADD_SVC_ERROR.BIL0033 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0034 ) {
        return { code: API_ADD_SVC_ERROR.BIL0034 };
      } else {
        return null;
      }
    });
  }

  _getContentPrepay() {
    // 콘텐츠이용 확인
    return this.apiService.request(API_CMD.BFF_07_0080, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        resp.result.code = API_CODE.CODE_00;
        return resp.result;
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0030 ) {
        return { code: API_ADD_SVC_ERROR.BIL0030 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0031 ) {
        return { code: API_ADD_SVC_ERROR.BIL0031 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0033 ) {
        return { code: API_ADD_SVC_ERROR.BIL0033 };
      } else if ( resp.code === API_ADD_SVC_ERROR.BIL0034 ) {
        return { code: API_ADD_SVC_ERROR.BIL0034 };
      } else {
        return null;
      }
    });
  }
}

export default MyTFareSubmainController;
