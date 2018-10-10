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
import DateHelper from '../../utils/date.helper';
import FormatHelper from '../../utils/format.helper';
import { MYT_JOIN_SUBMAIN_TITLE } from '../../types/title.type';

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
      this._getContractPlanPoint(),
      this._getInstallmentInfo(),
      this._getPausedState()
    ).subscribe(([myif, myhs, myfp, myap, mycpp, myinsp, myps]) => {
      if ( !myif.info ) {
        data.type = this.type;
        data.isPwdSt = this.isPwdSt;
        // 가입정보
        switch ( this.type ) {
          case 0:
            data.myInfo = myif;
            break;
          case 2:
            data.myInfo = this._convertWireInfo(myif);
            break;
        }
        data.myHistory = myhs; // 개통/변경 이력
        data.myFeeProduct = myfp; // 나의가입요금상품
        data.myAddProduct = myap; // 나의 부가,결합상품
        data.myContractPlan = mycpp; // 무약정플랜
        data.myInstallement = myinsp; // 약정,할부 정보
        data.myPausedState = myps; // 일시정지

        // 개통일자
        if (data.myHistory && data.myHistory.length > 0) {
          data.hsDate = DateHelper.getShortDateNoDot(data.myHistory[0].chgDt);
        }
        // 약정할부 노출여부
        if ( data.myInstallement && data.myInstallement.disProdNm ) {
          data.isInstallement = true;
        }
        // 무약정플랜 노출여부
        if ( data.myContractPlan && data.myContractPlan.usablePt ) {
          data.myContractPlan.point = FormatHelper.addComma(data.myContractPlan.usablePt);
          data.myContractPlan.count = data.myContractPlan.datas.length;
          data.isContractPlan = true;
        }
        // AC: 일시정지가 아닌 상태, SP: 일시정지 중인 상태
        if ( data.myPausedState.svcStCd === 'SP' ) {
          data.myPausedState.sDate = DateHelper.getShortDateNoDot(data.myPausedState.fromDt);
          data.myPausedState.eDate = DateHelper.getShortDateNoDot(data.myPausedState.toDt);
        }
        res.render('myt-join.submain.html', { data });
      } else {
        res.render('error.server-error.html', {
          title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
          code: myif.info.code,
          msg: myif.info.msg,
          svcInfo: svcInfo
        });
      }

    });
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
   * 유선(인터넷,IPTV,집전화) 가입정보
   * @param data :Object
   * @private
   */
  _convertWireInfo(data) {
    const result: any = {};
    // 서비스 약정
    result.svcPrdStaDt = DateHelper.getShortDateNoDot(data.svcPrdStaDt);
    result.svcPrdEndDt = DateHelper.getShortDateNoDot(data.svcPrdEndDt);
    result.svcAgrmtMth = data.svcAgrmtMth;
    // 세트 약정
    result.setNm = data.setNm;
    result.setPrdStaDt = DateHelper.getShortDateNoDot(data.setPrdStaDt);
    result.setPrdEndDt = DateHelper.getShortDateNoDot(data.setPrdEndDt);
    // 유선상품 수
    result.wireProdCnt = data.wireProdCnt;
    // 설치 주소
    result.address = data.basAddr + data.dtlAddr;
    return result;
  }

  // 가입정보
  _getMyInfo() {
    return this.apiService.request(API_CMD.BFF_05_0068, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return {
          info: resp
        };
      }
    });
  }

  // 나의 가입 요금상품
  _getMyFeeProduct() {
    return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        // 가입한 기본요금제 확인
        if ( resp.result.feePlanProd ) {
          return resp.result.feePlanProd;
        } else {
          return null;
        }
      } else {
        // error
        return {
          info: resp
        };
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
        return {
          info: resp
        };
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
        return {
          info: resp
        };
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
        return {
          info: resp
        };
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
        return {
          info: resp
        };
      }
    });
  }

  // 무약정플랜
  _getContractPlanPoint() {
    // 1년 기준
    const curDate = new Date();
    const beforeDate = new Date();
    beforeDate.setTime(curDate.getTime() - (365 * 24 * 60 * 60 * 1000));
    const sDate = DateHelper.getCurrentShortDate(beforeDate);
    const eDate = DateHelper.getCurrentShortDate(curDate);
    const params = {
      startYear: sDate.slice(0, 4),
      startMonth: sDate.slice(4, 6),
      startDay: sDate.slice(6, 8),
      endYear: eDate.slice(0, 4),
      endMonth: eDate.slice(4, 6),
      endDay: eDate.slice(6, 8)
    };
    return this.apiService.request(API_CMD.BFF_05_0060, params).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return {
          info: resp
        };
      }
    });
  }
}

export default MyTJoinSubmainController;
