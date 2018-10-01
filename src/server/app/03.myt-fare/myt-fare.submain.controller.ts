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
import { API_CMD, API_CODE } from '../../types/api-command.type';

class MytFareSubmainController extends TwViewController {
  constructor() {
    super();
  }


  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
    const data: any = {
      svcInfo: svcInfo,
      isMicroPayment: false,
      isNotAutoPayment: true,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc)
    };
    Observable.combineLatest(
      this._getClaimPays(),
      this._getNonPayment(),
      this._getPaymentInfo(),
      this._getTotalPayment(),
      this._getTaxInvoice(),
      this._getContribution()
    ).subscribe(([claim, nonpayment, paymentInfo, totalPayment, taxInvoice, contribution]) => {
      // 소액결제/콘텐츠 - 휴대폰이면서 미성년자가 아닌경우
      if ( svcInfo.svcAttrCd === 'M1' ) {
        data.isMicroPayment = true;
      }
      // 청구요금
      if ( claim ) {
        data.claim = claim;
        data.claimMonth = DateHelper.getShortKoreanMonth(claim.invDt);
        // 사용요금
        const usedAmt = parseInt(claim.useAmtTot, 10);
        data.claimUseAmt = FormatHelper.addComma(usedAmt.toString());
        // 할인요금
        const disAmt = Math.abs(claim.deduckTotInvAmt);
        data.claimDisAmt = FormatHelper.addComma(disAmt.toString());
        // Total
        data.claimPay = FormatHelper.addComma((usedAmt - disAmt).toString());
      }
      // 미납내역
      if ( nonpayment ) {
        data.nonpayment = nonpayment;
        data.nonpayment.unPaidTotSum = FormatHelper.addComma(nonpayment.unPaidTotSum);
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
        data.totalPayment = totalPayment;
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
    });
  }

  convertOtherLines(target, items): any {
    const nOthers: any = Object.assign([], items['M'], items['O'], items['S']);
    const list: any = [];
    nOthers.filter((item) => {
      if ( target.svcMgmtNum !== item.svcMgmtNum ) {
        list.push(item);
      }
    });
    return list;
  }

  _getClaimPays() {
    return this.apiService.request(API_CMD.BFF_05_0036, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.invDt.length === 0 ) {
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

  _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0058, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
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
        // error
        return null;
      }
    });
  }

  _getTaxInvoice() {
    return this.apiService.request(API_CMD.BFF_07_0017, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });

  }

  _getContribution() {
    return this.apiService.request(API_CMD.BFF_07_0038, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.totalCount === 0 ) {
          return null;
        }
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }
}

export default MytFareSubmainController;
