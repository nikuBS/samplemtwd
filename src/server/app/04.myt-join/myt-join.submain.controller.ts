/*
 * FileName: myt-join.submain.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.05
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../types/api-command.type';

class MyTJoinSubmainController extends TwViewController {
  private _svcType: number = -1;
  private _ptPwdSt: boolean = false;

  get type() {
    return this._svcType;
  }

  set type(value) {
    this._svcType = value;
  }

  get isPwdSt() {
    return this._ptPwdSt;
  }

  set isPwdSt(val) {
    this._ptPwdSt = val;
  }

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
    const data: any = {
      svcInfo: svcInfo,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc)
    };
    const requestList: any = [];
    this.__setType(svcInfo);
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분
    if ( svcInfo.pwdStCd && (svcInfo.pwdStCd === '10' || svcInfo.pwdStCd === '60') ) {
      // 10 -> 신청, 60 -> 초기화 -- 설정가능한상태
      this.isPwdSt = true;
    }
    Observable.combineLatest(
      this._getMyInfo(),
      this._getMyHistory(),
      this._getMyFeeProduct(),
      this._getAddtionalProduct(),
      /* 무약정플랜 API 추가 필요 */
      this._getInstallmentInfo(),
      this._getPausedState()
    ).subscribe(([myif, myhs, myfp, myap, myinsp, myps]) => {
      switch ( this.type ) {
        case 0:
          data.myInfo = this._convertMobileInfo(myif);
          break;
        case 1:
          data.myInfo = this._convertPPSInfo(myif);
          break;
        case 2:
          data.myInfo = this._convertWireInfo(myif);
          break;
      }
    });

    res.render('myt-join.submain.html', { data });
  }

  __setType(svcInfo) {
    switch ( svcInfo.svcAttrCd ) {
      case 'M1':
      case 'M3':
      case 'M4':
        this.type = 0;
        break;
      case 'M2':
        this.type = 1;
        break;
      case 'S1':
      case 'S2':
      case 'S3':
        this.type = 2;
        break;
    }
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

  /**
   * 무선, T-Login, T-PocketFi 가입정보
   * @param data :Object
   * @private
   */
  _convertMobileInfo(data) {
  }

  /**
   * 선불폰 가입정보
   * @param data :Object
   * @private
   */
  _convertPPSInfo(data) {
  }

  /**
   * 유선(인터넷,IPTV,집전화) 가입정보
   * @param data :Object
   * @private
   */
  _convertWireInfo(data) {
  }

  // 가입정보
  _getMyInfo() {
    return this.apiService.request(API_CMD.BFF_05_0068, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 나의 가입 요금상품
  _getMyFeeProduct() {
    return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        // 가입한 기본요금제 확인
        if ( resp.result.feePlanProd ) {
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

  // 개통/변경이력
  _getMyHistory() {
    return this.apiService.request(API_CMD.BFF_05_0061, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result && resp.result.length > 0 ) {
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

  // 일시정지/해제
  _getPausedState() {
    return this.apiService.request(API_CMD.BFF_05_0149, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 나의 가입 부가,결합 상품
  _getAddtionalProduct() {
    return this.apiService.request(API_CMD.BFF_05_0161, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 나의 가입정보_약정할부 정보
  _getInstallmentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0155, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 무약정플랜
}

export default MyTJoinSubmainController;
