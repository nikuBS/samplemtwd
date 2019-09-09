/*
 * MenuName: 나의 요금 > 서브메인 > 미납요금내역(MF_02)
 * @file myt-fare.submain.non-payment.ts
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.10.01
 * Summay: 미납요금내역, 자녀미납요금내역 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTFarePaymentOver extends TwViewController {
  private _childMgmtNum: string = '';

  constructor() {
    super();
  }

  set childMgmtNum(value) {
    this._childMgmtNum = value;
  }

  get childMgmtNum() {
    return this._childMgmtNum;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };
    if ( req.query && req.query.child ) {
      this.childMgmtNum = req.query.child;
    }

    // 자녀 회선 정보가 없는 경우 세션회선의 미납내역 조회
    if ( FormatHelper.isEmpty(this.childMgmtNum) ) {
      Observable.combineLatest(
        this._getNonPayment(),
        this._getPaymentPday(),
        this._getPaymentClaimDate(),
        this._getSuspension()
      ).subscribe(([nonpayment, possibleDay, claimDate, suspension]) => {
        if ( nonpayment ) {
          data.unPaidAmtList = nonpayment.unPaidAmtMonthInfoList;
          data.unPaidTotSum = FormatHelper.addComma(nonpayment.unPaidTotSum);

          if ( data.unPaidAmtList ) {
            // 데이터가 [null, null, object] 와 같은 형식으로 오는 경우가 있어 null인 경우는 필터함 (DV001-10125 미납요금 이용정지 계정)
            data.unPaidAmtList = data.unPaidAmtList.filter( obj => !FormatHelper.isEmpty(obj) );

            for ( let i = 0; i < data.unPaidAmtList.length; i++ ) {
              const tmp = data.unPaidAmtList[i];
              // DV001-16851 청구월은 +1 해야함
              tmp.fmtUnPaidInvDt =
                DateHelper.getShortDateWithFormatAddByUnit(tmp.unPaidInvDt, 1, 'months', 'YYYYMM');
            }
          }
        }
        if ( possibleDay ) {
          data.possibleDay = possibleDay;
          if ( possibleDay.suspStaDt ) {
            data.suspStaDt = DateHelper.getKoreanDate(possibleDay.suspStaDt);
          }
        }
        if ( claimDate ) {
          data.claimDate = claimDate;
        }
        if ( suspension ) {
          data.suspension = suspension;
        }
        res.render('submain/myt-fare.submain.non-paymt.html', { data });
      });

    } else {
      // 자녀 미납내역 조회
      Observable.combineLatest(
        this._getChildNonPayment()
      ).subscribe(([childPayment]) => {
        if ( childPayment ) {
          const convChildInfo = this._convChildInfo(childPayment);
          data.unPaidAmtList = convChildInfo.list;
          data.unPaidTotSum = FormatHelper.addComma(convChildInfo.totSum);

          if ( data.unPaidAmtList ) {
            // 데이터가 [null, null, object] 와 같은 형식으로 오는 경우가 있어 null인 경우는 필터함 (DV001-10125 미납요금 이용정지 계정)
            data.unPaidAmtList = data.unPaidAmtList.filter( obj => !FormatHelper.isEmpty(obj) );

            for ( let i = 0; i < data.unPaidAmtList.length; i++ ) {
              const tmp = data.unPaidAmtList[i];
              // DV001-16851 청구월은 +1 해야함
              tmp.fmtUnPaidInvDt =
                DateHelper.getShortDateWithFormatAddByUnit(tmp.unPaidInvDt, 1, 'months', 'YYYYMM');
            }
          }
        }
        res.render('submain/myt-fare.submain.non-paymt.html', { data });
      });

    }
  }

  // 자녀 미납내역을 일반 미납내역 형식으로 변경
  _convChildInfo(child) {
    const items = child.unPayAmtList;
    const result: any = [];
    let paidTotSum = 0;
    items.filter((item) => {
      result.push({
        unPaidInvDt: item.invDt,
        unPaidAmt: item.colBat
      });
      paidTotSum += parseInt(item.colBat.replace(/,/g, ''), 10);
    });
    return {
      list: result,
      totSum: paidTotSum.toString()
    };
  }


  // 자녀미납요금내역
  _getChildNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0047, {
      childSvcMgmtNum: this.childMgmtNum
    }, null, [], API_VERSION.V2).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.unPayAmtList && resp.result.unPayAmtList.length === 0 ) {
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
}

export default MyTFarePaymentOver;
