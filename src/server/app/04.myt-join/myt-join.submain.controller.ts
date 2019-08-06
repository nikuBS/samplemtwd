/*
 * @file myt-join.submain.ts
 * @author Kim InHwan
 * @since 2018-10-05
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import {API_CMD, API_CODE, API_NEW_NUMBER_ERROR, API_VERSION, SESSION_CMD} from '../../types/api-command.type';
import DateHelper from '../../utils/date.helper';
import FormatHelper from '../../utils/format.helper';
import { NEW_NUMBER_MSG, MYT_SUSPEND_STATE_EXCLUDE } from '../../types/string.type';
import { MYT_JOIN_SUBMAIN_TITLE } from '../../types/title.type';
import { SVC_ATTR_NAME, MYT_SUSPEND_REASON_CODE, MYT_SUSPEND_MILITARY_RECEIVE_CD } from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';
import BrowserHelper from '../../utils/browser.helper';

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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    this.__setType(svcInfo);
    const data: any = {
      svcInfo: Object.assign({}, svcInfo),
      pageInfo: pageInfo,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      // 현재 회선의 아이콘 클래스 이름
      currLineIconClass: this.getLineIconClassName(svcInfo.svcAttrCd),
      isApp: BrowserHelper.isApp(req) // App 여부
    };
    // 상태값 참조 : http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=53477532
    // 10: 신청/60: 초기화 -> 비밀번호 설정 유도
    // 20: 사용중/21:신청+등록완료 -> 회선 변경 시 비번 입력 필요, 비밀번호 변경 가능
    // 30: 변경
    // 70: 비밀번호 잠김 -> 지점에서만 초기화 가능
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분
    // 비밀번호 사용중 및 등록완료인 상태에서만 노
    if ( data.svcInfo.pwdStCd === '20' || data.svcInfo.pwdStCd === '21' || data.svcInfo.pwdStCd === '30' ) {
      this.isPwdSt = true;
    }
    // PPS, 휴대폰이 아닌 경우는 서비스명 노출
    if ( ['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
      data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
    }
    if ( ['S1', 'S2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
      data.svcInfo.svcNum = StringHelper.phoneStringToDash(data.svcInfo.svcNum);
    }
    Observable.combineLatest(
      this._getMyLine(),
      this._getMyInfo(),
      this._getMyHistory(),
      this._getAddtionalProduct(),
      this._getContractPlanPoint(),
      this._getInstallmentInfo(),
      this._getPausedState(),
      this._getLongPausedState(),
      // this._getWireFreeCall(data.svcInfo.svcNum), // 성능개선건으로 해당 API 호출 하지 않도록 변경[DV001-15523]
      // this._getOldNumberInfo(), // 성능이슈로 해당 API 호출 하지 않도록 변경 (DV001-14167)
      this._getChangeNumInfoService()
      // this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId)
    ).subscribe(([myline, myif, myhs, myap, mycpp, myinsp, myps, mylps, /*wirefree,*/ /*oldnum,*/ numSvc/*, banner*/]) => {
      // 가입정보가 없는 경우에는 에러페이지 이동 (PPS는 가입정보 API로 조회불가하여 무선이력으로 확인)
      if ( this.type === 1 ) {
        if ( myhs.info ) {
          this.error.render(res, {
            title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
            code: myhs.info.code,
            msg: myhs.info.msg,
            pageInfo: pageInfo,
            svcInfo: data.svcInfo
          });
          return false;
        }
      } else {
        if ( myif.info ) {
          this.error.render(res, {
            title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
            code: myif.info.code,
            msg: myif.info.msg,
            pageInfo: pageInfo,
            svcInfo: data.svcInfo
          });
          return false;
        }
      }
      data.type = this.type;
      data.isPwdSt = this.isPwdSt;
      // 가입회선정보
      if ( myline ) {
        const mobile = myline['M'];
        if ( !FormatHelper.isEmpty(mobile) ) {
          mobile.filter((item) => {
            if ( data.svcInfo.svcMgmtNum === item.svcMgmtNum ) {
              data.svcInfo.nickNm = item.nickNm;
            }
          });
        }
      }
      // 가입정보
      switch ( this.type ) {
        case 0:
          data.isOldNumber = this.isCheckingChgNum(data.svcInfo.svcNum);
          data.myInfo = myif;
          break;
        case 2:
          data.myInfo = this._convertWireInfo(myif);
          // 집전화/인터넷전화인 경우 B끼리 무료통화대상 조회 버튼 노출
          if ( data.svcInfo.svcAttrCd === 'S3' ) {
            data.isWireFree = true;
          }
          break;
        case 3:
          data.myInfo = myif;
          break;
      }
      data.myHistory = myhs; // 개통/변경 이력
      data.myAddProduct = myap; // 나의 부가,결합상품
      data.myContractPlan = mycpp; // 무약정플랜
      data.myInstallement = myinsp; // 약정,할부 정보
      data.myPausedState = myps; // 일시정지
      data.myLongPausedState = mylps; // 장기일시정지

      // 개통일자
      if ( data.myHistory ) {
        if ( data.myHistory.length > 0 ) {
          const h_chgDt = data.myHistory[0].chgDt;
          // 개통일자 DV001-13951 (마스킹시 ****.**.** 이와 같이 변경)
          data.hsDate = this.isMasking(h_chgDt) ? this.dateMaskingReplace(h_chgDt) : DateHelper.getShortDate(h_chgDt);
        } else {
          data.hsDate = null;
        }
      }
      // 부가, 결합상품 노출여부
      if ( data.myAddProduct && Object.keys(data.myAddProduct).length > 0 ) {
        data.isAddProduct = true;
        switch ( this.type ) {
          case 2:
            // 유선
            data.myAddProduct.addTotCnt = data.myAddProduct.additionCount;
            break;
          case 3:
            // T-login, T-pocketFi
            data.myAddProduct.addTotCnt = data.myAddProduct.addProdCnt;
            break;
          default:
            // 0: 모바일, 1: PPS
            if ( data.myAddProduct.productCntInfo ) {
              data.myAddProduct = data.myAddProduct.productCntInfo;
            }
            data.myAddProduct.addTotCnt = parseInt(data.myAddProduct.addProdPayCnt, 10) + parseInt(data.myAddProduct.addProdPayFreeCnt, 10);
            break;
        }
      }
      // 약정할부 노출여부
      if ( data.myInstallement && data.myInstallement.disProdNm ) {
        data.isInstallement = true;
      }
      // 무약정플랜은 PPS인 경우 비노출 처리[DVI001-15576]
      if ( this.type !== 1 ) {
        // 무약정플랜 노출여부 - 약정할부이 있는 경우에는 보여주지 않도록 수정 (DV001-13767)
        if ( data.myContractPlan && !data.isInstallement ) {
          data.myContractPlan.point = FormatHelper.addComma(data.myContractPlan.muPoint);
          data.myContractPlan.count = data.myContractPlan.muPointCnt;
          data.isContractPlan = true;
        }
      }
      // AC: 일시정지가 아닌 상태, SP: 일시정지 중인 상태
      if ( data.myPausedState && data.myPausedState.svcStCd === 'SP' ) {
        const fromDt = data.myPausedState.fromDt, toDt = data.myPausedState.toDt;
        data.myPausedState.sDate = this.isMasking(fromDt) ? fromDt : DateHelper.getShortDate(fromDt);
        data.myPausedState.eDate = toDt ? (this.isMasking(toDt) ? toDt : DateHelper.getShortDate(toDt)) : null; // 해외체류는 toDt 없음
        data.myPausedState.state = true;
        if ( data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.MILITARY
          || data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.OVERSEAS
          || data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.SEMI_MILITARY) {
          data.myLongPausedState = {
            state: true,
            opState: data.myPausedState.svcChgRsnNm.replace( MYT_SUSPEND_STATE_EXCLUDE , ''),
            fromDt: data.myPausedState.fromDt,
            toDt: data.myPausedState.toDt
          };
        }
      } else if ( data.myPausedState &&
        (( data.myPausedState.armyDt && data.myPausedState.armyDt !== '' )
        || ( data.myPausedState.armyExtDt && data.myPausedState.armyExtDt !== '' ))) {
        data.myLongPausedState = {
          state: true
        };
        data.myPausedState.armyDt = data.myPausedState.armyDt || data.myPausedState.armyExtDt;
      } else if ( data.myPausedState && data.myPausedState.reservedYn === 'Y' ) { // 일시정지 예약자
        const fromDt = data.myPausedState.fromDt, toDt = data.myPausedState.toDt;
        data.myPausedState.sDate = this.isMasking(fromDt) ? fromDt : DateHelper.getShortDate(fromDt);
        data.myPausedState.eDate = toDt ? (this.isMasking(toDt) ? toDt : DateHelper.getShortDate(toDt)) : null; // 해외체류는 toDt 없음
      }

      if ( data.myLongPausedState ) {
        const fromDt = data.myLongPausedState.fromDt, toDt = data.myLongPausedState.toDt;
        data.myLongPausedState.sDate = this.isMasking(fromDt) ? fromDt : DateHelper.getShortDate(fromDt);
        data.myLongPausedState.eDate = toDt ? (this.isMasking(toDt) ? toDt : DateHelper.getShortDate(toDt)) : null; // 해외체류는 toDt 없음
        data.myLongPausedState.state = true;
        // 군입대로 인한 장기 일시정지
        data.myLongPausedState.isArmy = (MYT_SUSPEND_MILITARY_RECEIVE_CD.indexOf(data.myLongPausedState.receiveCd) > -1);
        if ( data.myPausedState.svcStCd === 'AC' ) {
          if ( ( data.myPausedState.armyDt && data.myPausedState.armyDt !== '' )
            || ( data.myPausedState.armyExtDt && data.myPausedState.armyExtDt !== '' ) ) {
            const days = DateHelper.getDiffByUnit(data.myPausedState.toDt, DateHelper.getCurrentDate(), 'days');
            if ( days < 0 ) {
              data.myPausedState.state = false;
              data.myLongPausedState.state = false;
              delete data.myPausedState.armyDt;
            }
          }
        }

        // DV001-18322 스윙 문구 고객언어 반영
        if ( data.myLongPausedState.opState ) {
          data.myLongPausedState.opState = data.myLongPausedState.opState.replace( MYT_SUSPEND_STATE_EXCLUDE , '');
        }
      }

      if ( numSvc ) {
        if ( numSvc.code === API_CODE.CODE_00 ) {
          data.numberSvc = numSvc;
          data.isNotChangeNumber = true;
          if ( data.numberSvc.result.extnsPsblYn === 'Y' ) {
            data.numberChanged = true;
          } else {
            const curDate = new Date();
            const endDate = DateHelper.convDateFormat(data.numberSvc.result.notiEndDt);
            const betweenDay = this.daysBetween(curDate, endDate);
            if ( betweenDay < 28 ) {
              // 신청 중에는 연장 및 해지
              data.numberChanged = true;
            } else {
              // (번호변경안내서비스 종료 날짜 - 현재 날짜) 기준으로 28일이 넘으면 신청불가
              data.numberChanged = false;
              data.isNotChangeNumber = false;
            }
          }
        }
      }
      // 배너 정보 - client에서 호출하는 방식으로 변경 (19/01/22)
      // if ( banner.code === API_CODE.REDIS_SUCCESS ) {
      //   if ( !FormatHelper.isEmpty(banner.result) ) {
      //     data.banner = this.parseBanner(banner.result);
      //   }
      // }

      res.render('myt-join.submain.html', { data });
    });
  }

  /**
   * 현재 회선 타입을 세팅한다.
   * @param {JSON} svcInfo
   */
  __setType(svcInfo) {
    switch ( svcInfo.svcAttrCd ) {
      case 'M1':
        // 모바일
        this.type = 0;
        break;
      case 'M2':
        // PPS
        this.type = 1;
        break;
      case 'S1':
      case 'S2':
      case 'S3': // 집전화
        // 유선
        this.type = 2;
        break;
      case 'M3':
      case 'M4':
        // T-Login, T-FocketFi
        this.type = 3;
        break;
    }
  }

  daysBetween(date1, date2) {
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;
    // Convert both dates to milliseconds
    const date1_ms = date1.getTime();
    const date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    const difference_ms = (date1_ms - date2_ms);
    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY);
  }

  dateMaskingReplace(target): string {
    const reg1 = /\B((?=([\*]{2})(?![\*])))/g;
    const reg2 = /\B((?=([\.\*]{5})(?![\.\*])))/g;
    return target.replace(reg1, '.').replace(reg2, '.');
  }

  isMasking(target): boolean {
    let result = false;
    const MASK_CODE = '*';
    if ( target && target.indexOf(MASK_CODE) > -1 ) {
      result = true;
    }
    return result;
  }

  isCheckingChgNum(target): boolean {
    // 010, 012 제외 [DVI001-14863]
    const regexp = /^01([1|3-9]{1})/g;
    return regexp.test(target);
  }

  recompare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if ( codeA < codeB ) {
      comparison = 1;
    } else if ( codeA > codeB ) {
      comparison = -1;
    }
    return comparison;
  }

  compare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if ( codeA > codeB ) {
      comparison = 1;
    } else if ( codeA < codeB ) {
      comparison = -1;
    }
    return comparison;
  }

  /**
   * 선택 회선에 해당하는 아이콘 클래스 이름 반환
   * @param svcAttrCd : 회선정보
   */
  getLineIconClassName(svcAttrCd: string): string {
    let clsNm = 'cellphone';
    if ( svcAttrCd.indexOf('S') > -1 ) {
      if ( svcAttrCd === 'S1' ) {
        clsNm = 'internet';
      } else {
        clsNm = 'pc';
      }
    } else if ( ['M3', 'M4'].indexOf(svcAttrCd) > -1 ) {
      clsNm = 'tablet';
    }

    return clsNm;
  }

  convertOtherLines(target, items): any {
    const MOBILE = (items && items['m']) || [];
    const SPC = (items && items['s']) || [];
    const OTHER = (items && items['o']) || [];
    const list: any = [];
    MOBILE.sort(this.compare);
    SPC.sort(this.recompare);
    OTHER.sort(this.recompare);
    if ( MOBILE.length > 0 || OTHER.length > 0 || SPC.length > 0 ) {
      let nOthers: any = [];
      nOthers = nOthers.concat(MOBILE, SPC, OTHER);
      nOthers.filter((item) => {
        if ( target.svcMgmtNum !== item.svcMgmtNum ) {
          // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
          // item.nickNm = item.nickNm || item.eqpMdlNm;
          item.nickNm = item.nickNm || SVC_ATTR_NAME[item.svcAttrCd];
          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(item.svcAttrCd) === -1 ) {
            item.nickNm = SVC_ATTR_NAME[item.svcAttrCd];
          }
          item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
          item.className = this.getLineIconClassName(item.svcAttrCd);
          list.push(item);
        }
      });
    }
    return list;
  }

  /**
   * 유선(인터넷,IPTV,집전화) 가입정보
   * @param data :Object
   * @private
   */
  _convertWireInfo(data) {
    const result: any = {};
    // 가입자명
    result.custNm = data.wireReqrNm;
    // 서비스 약정
    result.svcPrdStaDt = this.isMasking(data.svcPrdStaDt) ? data.svcPrdStaDt :
      (data.svcPrdStaDt ? DateHelper.getShortDate(data.svcPrdStaDt) : data.svcPrdStaDt);
    result.svcPrdEndDt = this.isMasking(data.setPrdStaDt) ? data.svcPrdEndDt :
      (data.setPrdStaDt ? DateHelper.getShortDate(data.svcPrdEndDt) : data.svcPrdEndDt);
    result.svcAgrmtMth = data.svcAgrmtMth;
    // 세트 약정
    result.setNm = data.setNm;
    result.setPrdStaDt = this.isMasking(data.setPrdStaDt) ? data.setPrdStaDt :
      (data.setPrdStaDt ? DateHelper.getShortDate(data.setPrdStaDt) : data.setPrdStaDt);
    result.setPrdEndDt = this.isMasking(data.setPrdEndDt) ? data.setPrdEndDt :
      (data.setPrdEndDt ? DateHelper.getShortDate(data.setPrdEndDt) : data.setPrdEndDt);
    result.setAgrmtMth = data.setAgrmtMth;
    // 유선상품 수
    result.wireProdCnt = data.wireProdCnt;
    // 설치 주소
    result.address = data.fullAddr; /*data.basAddr + data.dtlAddr;*/
    return result;
  }

  // 가입회선조회
  _getMyLine() {
    return this.apiService.requestStore(SESSION_CMD.BFF_03_0004, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }


  // 가입정보
  _getMyInfo() {
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0068, {}).map((resp) => {
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

  // 개통/변경이력
  _getMyHistory() {
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0061, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
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

  // 장기 일시정지
  _getLongPausedState() {
    return this.apiService.request(API_CMD.BFF_05_0194, {}).map((resp) => {
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
    let API_URL = API_CMD.BFF_05_0161;
    switch ( this.type ) {
      case 2:
        API_URL = API_CMD.BFF_05_0179;
        break;
      case 3:
        API_URL = API_CMD.BFF_05_0166;
        break;
    }
    return this.apiService.request(API_URL, {}).map((resp) => {
      // TODO: 서버 API response와 명세서 내용이 일치하지 않는 문제로 완료 후 작업 예정
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
    // [DV001-14401] 성능개선으로 API 주소 변경함 (버전 변경됨 v1 -> v2)
    return this.apiService.request(API_CMD.BFF_05_0155, {}, null, [], API_VERSION.V2).map((resp) => {
    // return this.apiService.request(API_CMD.BFF_05_0155, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 무약정플랜
  _getContractPlanPoint() {
    return this.apiService.request(API_CMD.BFF_05_0175, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // B끼리 무료통화 조회
  _getWireFreeCall(number) {
    const params = {
      tel01: number.split('-')[0],
      tel02: number.split('-')[1],
      tel03: number.split('-')[2]
    };
    // dummy 전화번호 값으로 요청 하여 freeCallYn 값 체크
    return this.apiService.request(API_CMD.BFF_05_0160, params).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result && resp.freeCallYn === 'Y' && resp.noChargeYn === 'Y' ) {
          return 'Y';
        } else {
          return null;
        }
      } else {
        // error
        return null;
      }
    });
  }

  // 010 번호 변경 가능 여부 확인
  _getOldNumberInfo() {
    return this.apiService.request(API_CMD.BFF_05_0186, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 번호변경 안내 서비스
  _getChangeNumInfoService() {
    return this.apiService.request(API_CMD.BFF_05_0180, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp;
      } else {
        // error
        if ( resp.code === API_NEW_NUMBER_ERROR.MOD0030 ) {
          return {
            code: API_NEW_NUMBER_ERROR.MOD0030,
            msg: NEW_NUMBER_MSG.MOD0030
          };
        } else if ( resp.code === API_NEW_NUMBER_ERROR.MOD0031 ) {
          return {
            code: API_NEW_NUMBER_ERROR.MOD0031,
            msg: NEW_NUMBER_MSG.MOD0031
          };
        }
      }
    });
  }
}


export default MyTJoinSubmainController;
