/*
 * FileName: myt-join.submain.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.05
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, API_NEW_NUMBER_ERROR } from '../../types/api-command.type';
import DateHelper from '../../utils/date.helper';
import FormatHelper from '../../utils/format.helper';
import { NEW_NUMBER_MSG } from '../../types/string.type';
import { MYT_JOIN_SUBMAIN_TITLE } from '../../types/title.type';
import { REDIS_BANNER_ADMIN } from '../../types/redis.type';
import { SVC_ATTR_NAME } from '../../types/bff.type';

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
    if ( this.type === 2 ) {
      if ( req.path.indexOf('w') === -1 ) {
        res.redirect('/myt-join/submain_w');
      }
    } else {
      if ( req.path.indexOf('w') > -1 ) {
        res.redirect('/myt-join/submain');
      }
    }
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc)
    };
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분
    if ( svcInfo.pwdStCd && (svcInfo.pwdStCd === '10' || svcInfo.pwdStCd === '60') ) {
      // 10 -> 신청, 60 -> 초기화 -- 설정가능한상태
      this.isPwdSt = true;
    }
    // PPS, 휴대폰이 아닌 경우는 서비스명 노출
    if ( ['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
      data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
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
      this._getWireFreeCall(),
      this._getOldNumberInfo(),
      this._getChangeNumInfoService(),
      this.redisService.getData(REDIS_BANNER_ADMIN + pageInfo.menuId)
    ).subscribe(([myline, myif, myhs, myap, mycpp, myinsp, myps, mylps, wirefree, oldnum, numSvc, banner]) => {
      // 가입정보가 없는 경우에는 에러페이지 이동 (PPS는 가입정보 API로 조회불가하여 무선이력으로 확인)
      if (this.type === 1) {
        if (myhs.info) {
          this.error.render(res, {
            title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
            code: myhs.info.code,
            msg: myhs.info.msg,
            svcInfo: svcInfo
          });
          return false;
        }
      } else {
        if ( myif.info ) {
          this.error.render(res, {
            title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
            code: myif.info.code,
            msg: myif.info.msg,
            svcInfo: svcInfo
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
          data.isOldNumber = oldnum && (oldnum.numChgTarget || oldnum.numChgTarget === 'true');
          data.myInfo = myif;
          break;
        case 2:
          data.myInfo = this._convertWireInfo(myif);
          if ( wirefree && wirefree.freeCallYn === 'Y' ) {
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
      if ( data.myHistory && data.myHistory.length > 0 ) {
        data.hsDate = DateHelper.getShortDateNoDot(data.myHistory[0].chgDt);
      }
      // 부가, 결합상품 노출여부
      if ( data.myAddProduct && Object.keys(data.myAddProduct).length > 0 ) {
        data.isAddProduct = true;
        switch ( this.type ) {
          case 2:
            // 유선
            data.myAddProduct.addTotCnt = data.myAddProduct.additionCount;
            break;
          case 1:
          case 3:
            // T-login, T-pocketFi, PPS
            data.myAddProduct.addTotCnt = data.myAddProduct.addProdCnt;
            break;
          default:
            if ( data.myAddProduct.productCntInfo ) {
              data.myAddProduct = data.myAddProduct.productCntInfo;
            }
            data.myAddProduct.addTotCnt =
              parseInt(data.myAddProduct.addProdPayCnt, 10) + parseInt(data.myAddProduct.addProdPayFreeCnt, 10) +
              parseInt(data.myAddProduct.comProdCnt, 10);
            break;
        }
      }
      // 약정할부 노출여부
      if ( data.myInstallement && data.myInstallement.disProdNm ) {
        data.isInstallement = true;
      }
      // 무약정플랜 노출여부
      if ( data.myContractPlan && data.myContractPlan.muPointYn === 'Y' ) {
        data.myContractPlan.point = FormatHelper.addComma(data.myContractPlan.muPoint);
        data.myContractPlan.count = data.myContractPlan.muPointCnt;
        data.isContractPlan = true;
      }
      // AC: 일시정지가 아닌 상태, SP: 일시정지 중인 상태
      if ( data.myPausedState && data.myPausedState.svcStCd === 'SP' ) {
        const fromDt = data.myPausedState.fromDt, toDt = data.myPausedState.toDt;
        data.myPausedState.sDate = this.isMasking(fromDt) ? fromDt : DateHelper.getShortDateNoDot(fromDt);
        data.myPausedState.eDate = this.isMasking(toDt) ? toDt : DateHelper.getShortDateNoDot(toDt);
        data.myPausedState.state = true;
        if ( data.myPausedState.svcChgRsnCd === '21' || data.myPausedState.svcChgRsnCd === '22' ) {
          data.myLongPausedState = {
            state: true,
            opState: data.myPausedState.svcChgRsnNm
          };
        }
      }

      if ( data.myLongPausedState ) {
        data.myLongPausedState.state = true;
      }

      if ( numSvc ) {
        data.numberSvc = numSvc;
        if ( data.numberSvc.code === API_CODE.CODE_00 ) {
          data.isNotChangeNumber = true;
          if ( data.numberSvc.extnsPsblYn === 'Y' ) {
            data.numberChanged = true;
          } else {
            const curDate = new Date();
            const endDate = DateHelper.convDateFormat(data.numberSvc.notiEndDt);
            const betweenDay = this.daysBetween(curDate, endDate);
            if ( betweenDay > 28 ) {
              // (번호변경안내서비스 종료 날짜 - 현재 날짜) 기준으로 28일이 넘으면 신청불가
              data.isNotChangeNumber = false;
            }
          }
        }
      }
      // 배너 정보
      if ( banner.code === API_CODE.REDIS_SUCCESS ) {
        if ( !FormatHelper.isEmpty(banner.result) ) {
          data.banner = this.parseBanner(banner.result);
        }
      }

      res.render('myt-join.submain.html', { data });
    });
  }

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
      case 'S3':
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

  parseBanner(data: any) {
    const banners = data.banners;
    const sort = {};
    const result: any = [];
    banners.forEach((item) => {
      // 배너노출순번의 정보가 있는 경우
      if ( item.bnnrExpsSeq ) {
        sort[item.bnnrExpsSeq] = item;
      } else {
        sort[item.bnnrSeq] = item;
      }
    });
    const keys = Object.keys(sort).sort();
    keys.forEach((key) => {
      result.push(sort[key]);
    });

    return result;
  }

  daysBetween(date1, date2) {
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;
    // Convert both dates to milliseconds
    const date1_ms = date1.getTime();
    const date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    const difference_ms = Math.abs(date1_ms - date2_ms);
    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY);
  }

  isMasking(target): boolean {
    let result = false;
    const MASK_CODE = '*';
    if ( target && target.indexOf(MASK_CODE) > -1 ) {
      result = true;
    }
    return result;
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
          let clsNm = 'cellphone';
          if ( item.svcAttrCd.indexOf('S') > -1 ) {
            clsNm = 'pc';
          } else if ( ['M3', 'M4'].indexOf(item.svcAttrCd) > -1 ) {
            clsNm = 'tablet';
          }
          item.nickNm = item.eqpMdlNm || item.nickNm;
          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(item.svcAttrCd) === -1 ) {
            item.nickNm = SVC_ATTR_NAME[item.svcAttrCd];
          }
          item.className = clsNm;
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
    result.svcPrdStaDt = this.isMasking(data.svcPrdStaDt) ? data.svcPrdStaDt : DateHelper.getShortDateNoDot(data.svcPrdStaDt);
    result.svcPrdEndDt = this.isMasking(data.svcPrdEndDt) ? data.svcPrdEndDt : DateHelper.getShortDateNoDot(data.svcPrdEndDt);
    result.svcAgrmtMth = data.svcAgrmtMth;
    // 세트 약정
    result.setNm = data.setNm;
    result.setPrdStaDt = this.isMasking(data.setPrdStaDt) ? data.setPrdStaDt : DateHelper.getShortDateNoDot(data.setPrdStaDt);
    result.setPrdEndDt = this.isMasking(data.setPrdEndDt) ? data.setPrdEndDt : DateHelper.getShortDateNoDot(data.setPrdEndDt);
    // 유선상품 수
    result.wireProdCnt = data.wireProdCnt;
    // 설치 주소
    result.address = data.basAddr + data.dtlAddr;
    return result;
  }

  // 가입회선조회
  _getMyLine() {
    return this.apiService.request(API_CMD.BFF_03_0004, {}).map((resp) => {
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
  _getWireFreeCall() {
    // dummy 전화번호 값으로 요청 하여 freeCallYn 값 체크
    return this.apiService.request(API_CMD.BFF_05_0160, {
      tel01: '012',
      tel02: '345',
      tel03: '6789'
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
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
