/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../types/api-command.type';

class MytDataSubmainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      isBenefit: false,
      immCharge: false,
      present: false
    };
    Observable.combineLatest(
      // this._getRemnantData(),
      this._getDataPresent(),
      this._getRefillCoupon(),
      // this._getPrepayCoupon(),
      this._getDataChargeBreakdown(),
      this._getDataPresentBreakdown(),
      this._getTingPresentBreakdown(),
      this._getEtcBreakdown(),
      this._getRefillPresentBreakdown(),
      this._getRefillUsedBreakdown(),
      this._getUsagePatternSevice()
    ).subscribe(([/*remnant,*/ present, refill, /*prepay,*/]) => {
      if ( svcInfo.svcAttrCd === 'M2' || svcInfo.svcAttrCd === 'M3' /* || remnant.data === 0 기본 DATA 제공량이 없는 경우*/ ) {
        data.immCharge = true;
      }
      if ( present && (present.familyMemberYn === 'Y' || present.goodFamilyMemberYn === 'Y') ) {
        data.present = true;
      }
      if ( refill && refill.length > 0 ) {
        data.refill = refill;
      }
      if ( svcInfo.svcAttrCd === 'M1' || svcInfo.svcAttrCd === 'M2' || svcInfo.svcAttrCd === 'M3' ) {
        // 휴대폰, T-pocketFI, T-Login  경우 노출
        data.isBenefit = true;
      }
    });

    res.render('usage/myt-data.submain.html', { svcInfo: svcInfo });
  }

  /**
   * 실시간 잔여량 - publishing 상태로 화면만 노출
   * 8-1 개발되지 않은 상태로 scope out
   _getRemnantData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0094, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {

      }
    });
  }*/
  // 나의 리필 쿠폰
  _getRefillCoupon(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  /**
   * 선불형 쿠폰 TBD 항목
   _getPrepayCoupon():  Observable<any> {

  }*/
  // T끼리 데이터 선물 버튼
  _getDataPresent() {
    return this.apiService.request(API_CMD.BFF_06_0015, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // T 끼리 선물하기 선물내역
  _getDataPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0018, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 팅요금 선물내역
  _getTingPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0026, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 데이터한도요금제 충전내역
  _getDataChargeBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0042, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 팅/쿠키즈/안심음성 충전내역
  _getEtcBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0032, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 리필쿠폰 사용이력조회
  _getRefillUsedBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 리필쿠폰 선물내역
  _getRefillPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0003, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 최근 사용패턴 사용량
  _getUsagePatternSevice() {
    const curDate = new Date().getDate();
    return this.apiService.request(API_CMD.BFF_05_0091, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( curDate < 5 ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        // error
        return null;
      }
    });
  }
}

export default MytDataSubmainController;

