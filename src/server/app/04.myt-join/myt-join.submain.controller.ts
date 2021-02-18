/*
 * @file myt-join.submain.ts
 * @author Kim InHwan
 * @since 2018-10-05
 *
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE, API_VERSION, SESSION_CMD} from '../../types/api-command.type';
import DateHelper from '../../utils/date.helper';
import FormatHelper from '../../utils/format.helper';
import {MYT_SUSPEND_STATE_EXCLUDE, NEW_NUMBER_MSG} from '../../types/string.type';
import {MYT_JOIN_SUBMAIN_TITLE} from '../../types/title.type';
import {MYT_SUSPEND_MILITARY_RECEIVE_CD, MYT_SUSPEND_REASON_CODE, SVC_ATTR_E, SVC_ATTR_NAME, SVC_CDGROUP} from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';
import BrowserHelper from '../../utils/browser.helper';
// OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
import CommonHelper from '../../utils/common.helper';

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
    this._render(req, res, next, svcInfo, allSvc, child, pageInfo);
  }

  _setData(req, res, next, svcInfo, allSvc, child, pageInfo) {
    this.__setType(svcInfo);
    const data: any = {
      svcInfo: svcInfo, // Object.assign({}, svcInfo),
      pageInfo: pageInfo,
      // 다른 회선 항목
      // otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      otherLines: this.convertOtherLines(svcInfo, allSvc),
      // 현재 회선의 아이콘 클래스 이름
      currLineIconClass: this.getLineIconClassName(svcInfo.svcAttrCd),
      isApp: BrowserHelper.isApp(req) // App 여부
    };
    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    CommonHelper.addCurLineInfo(data.svcInfo);
    // 상태값 참조 : http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=53477532
    // 10: 신청/60: 초기화 -> 비밀번호 설정 유도
    // 20: 사용중/21:신청+등록완료 -> 회선 변경 시 비번 입력 필요, 비밀번호 변경 가능
    // 30: 변경
    // 70: 비밀번호 잠김 -> 지점에서만 초기화 가능
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분
    // 비밀번호 사용중 및 등록완료인 상태에서만 노
    if (data.svcInfo.pwdStCd === '20' || data.svcInfo.pwdStCd === '21' || data.svcInfo.pwdStCd === '30') {
      this.isPwdSt = true;
    }
    // PPS, 휴대폰이 아닌 경우는 서비스명 노출
    if (['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1) {
      data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
    }
    if (['S1', 'S2'].indexOf(data.svcInfo.svcAttrCd) === -1) {
      data.svcInfo.svcNum = StringHelper.phoneStringToDash(data.svcInfo.svcNum);
    }
    return data;
  }

  _render(req, res, next, svcInfo, allSvc, child, pageInfo) {
    // 상위클래스에서 하위 클래스에 메서드를 호출 하는 경우 컴파일 오류가 발생하여 하위 클래스에서
    // 상위 클래스로 호출 하는 방식으로 처리하기 위해 함수로 분리하여 처리
    const data = this._setData(req, res, next, svcInfo, allSvc, child, pageInfo);
    this.__requestApiAfterRender(res, data);
  }

  __requestApiAfterRender(res, data) {
    const requestApiList = this._requestApiList(data.svcInfo);
    Observable.combineLatest(
        requestApiList
    ).subscribe((responses) => {
      const _parsing = this.__parsingRequestData({
        res, responses, data
      });
      if (_parsing) {
        // 다른 페이지를 찾고 계신가요 통계코드 추가
        this.getXtEid(data);
        res.render('myt-join.submain.html', { data });
      }
    });
  }

  /**
   * 현재 회선 타입을 세팅한다.
   * @param {JSON} svcInfo
   */
  __setType(svcInfo) {
    switch (svcInfo.svcAttrCd) {
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

  isMasking(target): boolean {
    return target && target.indexOf('*') > -1;
  }

  isCheckingChgNum(target): boolean {
    // 010, 012 제외 [DVI001-14863]
    return /^01([1|3-9])/g.test(target);
  }

  recompare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if (codeA < codeB) {
      comparison = 1;
    } else if (codeA > codeB) {
      comparison = -1;
    }
    return comparison;
  }

  compare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if (codeA > codeB) {
      comparison = 1;
    } else if (codeA < codeB) {
      comparison = -1;
    }
    return comparison;
  }

  __parsingRequestData(parsingInfo) {
    const { res, responses, data } = parsingInfo;
    const [ myline, myif, myhs, myap, mycpp, myinsp,
      myps, mylps, numSvc, wlap /* , wilp, smcp */ /* , wirefree, oldnum, banner */] = responses;

    // 가입정보가 없는 경우에는 에러페이지 이동 (PPS는 가입정보 API로 조회불가하여 무선이력으로 확인)
    if (this.type === 1) {
      if (myhs.info) {
        this.error.render(res, {
          title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
          code: myhs.info.code,
          msg: myhs.info.msg,
          pageInfo: data.pageInfo,
          svcInfo: data.svcInfo
        });
        return false;
      }
    } else {
      console.log(myif.info);
      if (myif.info) {
        this.error.render(res, {
          title: MYT_JOIN_SUBMAIN_TITLE.MAIN,
          code: myif.info.code,
          msg: myif.info.msg,
          pageInfo: data.pageInfo,
          svcInfo: data.svcInfo
        });
        return false;
      }
    }
    console.log('################################');
    data.type = this.type;
    data.isPwdSt = this.isPwdSt;
    // 가입회선정보
    if (myline) {
      const mobile = myline['M'];
      if (!FormatHelper.isEmpty(mobile)) {
        mobile.filter((item) => {
          if (data.svcInfo.svcMgmtNum === item.svcMgmtNum) {
            data.svcInfo.nickNm = item.nickNm;
          }
        });
      }
    }
    // 가입정보
    switch (this.type) {
      case 0:
        data.isOldNumber = this.isCheckingChgNum(data.svcInfo.svcNum);
        data.myInfo = myif;
        break;
      case 2:
        data.myInfo = this._convertWireInfo(myif);
        // 집전화/인터넷전화인 경우 B끼리 무료통화대상 조회 버튼 노출
        if (data.svcInfo.svcAttrCd === 'S3') {
          data.isWireFree = true;
        }
        break;
      case 3:
        data.myInfo = myif;
        break;
    }
    data.myHistory = myhs.length ? myhs : null; // 개통/변경 이력
    data.myAddProduct = myap; // 나의 부가,결합상품
    data.myContractPlan = mycpp; // 무약정플랜
    data.myInstallement = myinsp; // 약정,할부 정보
    data.myPausedState = myps; // 일시정지
    data.myLongPausedState = mylps; // 장기일시정지

    // 부가, 결합상품 노출여부
    if (!FormatHelper.isEmpty(data.myAddProduct)) {
      data.isAddProduct = true;
      switch (this.type) {
        case 2:
          // 유선
          data.myAddProduct.addProdTotCnt = data.myAddProduct.additionCount;
          break;
        case 3:
          // T-login, T-pocketFi
          data.myAddProduct.addProdTotCnt = data.myAddProduct.addProdCnt;
          break;
        default:
          // 0: 모바일, 1: PPS
          if (data.myAddProduct.productCntInfo) {
            data.myAddProduct = data.myAddProduct.productCntInfo;
          }
          // 스마트콜Pick 상품이 있는 경우
          /*
					if (smcp > 0) {
						// 가입된 부가상품모두에서 스마트콜pick 옵션상품 제외
						data.myAddProduct.addProdTotCnt = wilp - smcp;
						if (data.myAddProduct.addProdTotCnt < 0) {
							// XXX: 이럴 수 없을 듯한데, 혹시나...
							data.myAddProduct.addProdTotCnt = 0;
						}
					} else {
					*/
          if (wlap.count > 0) {
            // 가입된 부가상품모두에서 스마트콜pick 옵션상품 제외
            data.myAddProduct.addProdTotCnt = wlap.count;
          } else {
            data.myAddProduct.addProdTotCnt = parseInt(data.myAddProduct.addProdPayCnt, 10) + parseInt(data.myAddProduct.addProdPayFreeCnt, 10);
          }
          break;
      }
      // 옵션/할인프로그램 개수 추가
      data.myAddProduct.prodTotCnt = data.myAddProduct.addProdTotCnt + (data.myAddProduct.disProdCnt || 0);
    } else {
      // 옵션/할인프로그램 개수 추가
      data.myAddProduct = { prodTotCnt: 0 };
    }
    // 약정할부 노출여부
    if (data.myInstallement && data.myInstallement.disProdNm) {
      data.isInstallement = true;
    }
    // 무약정플랜은 PPS인 경우 비노출 처리[DVI001-15576]
    if (this.type !== 1) {
      // 무약정플랜 노출여부 - 약정할부이 있는 경우에는 보여주지 않도록 수정 (DV001-13767)
      if (data.myContractPlan && !data.isInstallement) {
        data.myContractPlan.point = FormatHelper.addComma(data.myContractPlan.muPoint);
        data.myContractPlan.count = data.myContractPlan.muPointCnt;
        data.isContractPlan = true;
      }
    }
    // AC: 일시정지가 아닌 상태, SP: 일시정지 중인 상태
    if (data.myPausedState) {
      if (data.myPausedState.svcStCd === 'SP') {
        const fromDt = data.myPausedState.fromDt, toDt = data.myPausedState.toDt;
        data.myPausedState.sDate = DateHelper.getShortDate(fromDt);
        data.myPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
        data.myPausedState.state = true;
        if (data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.MILITARY
            || data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.OVERSEAS
            || data.myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.SEMI_MILITARY) {
          data.myLongPausedState = {
            state: true,
            opState: data.myPausedState.svcChgRsnNm.replace(MYT_SUSPEND_STATE_EXCLUDE, ''),
            fromDt: data.myPausedState.fromDt,
            toDt: data.myPausedState.toDt
          };
        }
      } else if (((data.myPausedState.armyDt && data.myPausedState.armyDt !== '')
          || (data.myPausedState.armyExtDt && data.myPausedState.armyExtDt !== ''))) {
        data.myLongPausedState = {
          state: true
        };
        data.myPausedState.armyDt = data.myPausedState.armyDt || data.myPausedState.armyExtDt;
      } else if (data.myPausedState.reservedYn === 'Y') { // 일시정지 예약자
        const fromDt = data.myPausedState.fromDt, toDt = data.myPausedState.toDt;
        data.myPausedState.sDate = DateHelper.getShortDate(fromDt);
        data.myPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
      }
    }

    if (data.myLongPausedState) {
      const fromDt = data.myLongPausedState.fromDt, toDt = data.myLongPausedState.toDt;
      data.myLongPausedState.sDate = DateHelper.getShortDate(fromDt);
      data.myLongPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
      data.myLongPausedState.state = true;
      // 군입대로 인한 장기 일시정지
      data.myLongPausedState.isArmy = (MYT_SUSPEND_MILITARY_RECEIVE_CD.indexOf(data.myLongPausedState.receiveCd) > -1);
      if (data.myPausedState.svcStCd === 'AC') {
        if ((data.myPausedState.armyDt && data.myPausedState.armyDt !== '')
            || (data.myPausedState.armyExtDt && data.myPausedState.armyExtDt !== '')) {
          const days = DateHelper.getDiffByUnit(data.myPausedState.toDt, DateHelper.getCurrentDate(), 'days');
          if (days < 0) {
            data.myPausedState.state = false;
            data.myLongPausedState.state = false;
            delete data.myPausedState.armyDt;
          }
        }
        // 장기일시정지 처리완료 상태에서 멈추는 문제 해결 (장기일시정지, 처리완료, 신청일이 오늘 포함 이전이면, 새로 신청가능한 것으로
        if (data.myLongPausedState.opStateCd === 'C' && fromDt <= DateHelper.getCurrentShortDate()) {
          data.myLongPausedState.stateReleased = true;
        }
      }

      // DV001-18322 스윙 문구 고객언어 반영
      if (data.myLongPausedState.opState) {
        data.myLongPausedState.opState = data.myLongPausedState.opState.replace(MYT_SUSPEND_STATE_EXCLUDE, '');
      }
    }

    /*
				번호 변경 이후 28일이내에 "번호변경 안내서비스"를 신청할 수 있는데,
				28일 이내이면 numChgFlag = 'Y' 로 보내준다. 28일이 지나면 MOD0030 code 리턴
		 */
    if (numSvc && numSvc.code === API_CODE.CODE_00) {
      const {extnsPsblYn, notiEndDt} = numSvc.result;
      Object.assign(data, {
        numberSvc: numSvc,
        isNotChangeNumber: true,
        numberChanged: extnsPsblYn === 'Y'
      });

      if (extnsPsblYn !== 'Y') {
        if (!FormatHelper.isEmpty(notiEndDt)) {
          const curDate = new Date();
          const endDate = DateHelper.convDateFormat(notiEndDt);
          const betweenDay = this.daysBetween(curDate, endDate);
          if (betweenDay < 28) {
            // 신청 중에는 연장 및 해지
            data.numberChanged = true;
          } else {
            // (번호변경안내서비스 종료 날짜 - 현재 날짜) 기준으로 28일이 넘으면 신청불가
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
  }

  /**
   * api request List
   * @param svcInfo
   */

  _requestApiList(svcInfo) {
    return [
      this._getMyLine(),
      this._getMyInfo(),
      this._getMyHistory(),
      this._getAddtionalProduct(),
      this._getContractPlanPoint(),
      this._getInstallmentInfo(),
      this._getPausedState(),
      this._getLongPausedState(),
      this._getChangeNumInfoService(),
      this._wirelessAdditions(svcInfo)
      /*
        this._wirelessAdditionProduct(svcInfo),
        this._smartCallPickProduct(svcInfo)
        */
      // this._getWireFreeCall(data.svcInfo.svcNum), // 성능개선건으로 해당 API 호출 하지 않도록 변경[DV001-15523]
      // this._getOldNumberInfo(), // 성능이슈로 해당 API 호출 하지 않도록 변경 (DV001-14167)
      // this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId)
    ];
  }

  /**
   * 선택 회선에 해당하는 아이콘 클래스 이름 반환
   * @param {String} svcAttrCd: 회선정보
   */
  getLineIconClassName(svcAttrCd: string): string {
    let clsNm = 'cellphone';
    if (svcAttrCd.indexOf('S') > -1) {
      if (svcAttrCd === 'S1') {
        clsNm = 'internet';
      } else {
        clsNm = 'pc';
      }
    } else if (['M3', 'M4'].indexOf(svcAttrCd) > -1) {
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
    if (MOBILE.length > 0 || OTHER.length > 0 || SPC.length > 0) {
      let nOthers: any = [];
      nOthers = nOthers.concat(MOBILE, SPC, OTHER);
      nOthers.filter((item) => {
        if (target.svcMgmtNum !== item.svcMgmtNum) {
          // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
          // item.nickNm = item.nickNm || item.eqpMdlNm;
          item.nickNm = item.nickNm || SVC_ATTR_NAME[item.svcAttrCd];
          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if (['M1', 'M2'].indexOf(item.svcAttrCd) === -1) {
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
    return {
      // 가입자명
      custNm: data.wireReqrNm,
      // 서비스 약정
      svcPrdStaDt: this.isMasking(data.svcPrdStaDt) ? data.svcPrdStaDt :
          (data.svcPrdStaDt ? DateHelper.getShortDate(data.svcPrdStaDt) : data.svcPrdStaDt),
      svcPrdEndDt: this.isMasking(data.setPrdStaDt) ? data.svcPrdEndDt :
          (data.setPrdStaDt ? DateHelper.getShortDate(data.svcPrdEndDt) : data.svcPrdEndDt),
      svcAgrmtMth: data.svcAgrmtMth,
      // 세트 약정
      setNm: data.setNm,
      setPrdStaDt: this.isMasking(data.setPrdStaDt) ? data.setPrdStaDt :
          (data.setPrdStaDt ? DateHelper.getShortDate(data.setPrdStaDt) : data.setPrdStaDt),
      setPrdEndDt: this.isMasking(data.setPrdEndDt) ? data.setPrdEndDt :
          (data.setPrdEndDt ? DateHelper.getShortDate(data.setPrdEndDt) : data.setPrdEndDt),
      setAgrmtMth: data.setAgrmtMth,
      // 유선상품 수
      wireProdCnt: data.wireProdCnt,
      // 설치 주소
      address: data.fullAddr /*data.basAddr + data.dtlAddr;*/
    };
  }

  // 가입회선조회
  _getMyLine() {
    return this.apiService.requestStore(SESSION_CMD.BFF_03_0004, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
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
      if (resp.code === API_CODE.CODE_00) {
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
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return null;
    });
  }

  // 일시정지/해제
  _getPausedState() {
    if (this.type === 2) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0149, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return null;
    });
  }

  // 장기 일시정지
  _getLongPausedState() {
    if (this.type === 2) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0194, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return null;
    });
  }

  // 나의 가입 부가,결합 상품
  _getAddtionalProduct() {
    // 유선과 나머지 회선 구분하여 BFF 호출
    if (this.type === 2) { // 유선회선일때
      return Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_05_0179, {}), // 부가상품 갯수 조회
        this.apiService.request(API_CMD.BFF_05_0133, {}) // 유선 결합상품 조회. BFF 매핑 등록하기
      ).map( ([additionResp, combinationsResp]) => {
        const addition = additionResp.code === API_CODE.CODE_00 ? additionResp.result : null;
        const combinations = combinationsResp.code === API_CODE.CODE_00 ? combinationsResp.result : null;
        const comProdCnt = combinations.combinationMemberCnt ?
            parseInt(combinations.combinationMemberCnt || 0, 10) : combinations.combinationMemberList ?
                combinations.combinationMemberList.length : 0
        return {
          feePlanProd: addition.feePlanProd || null,
          addProdPayCnt: parseInt(addition.payAdditionCount || 0, 10), // 유료 부가상품
          addProdPayFreeCnt: parseInt(addition.freeAdditionCount || 0, 10), // 무료 부가상품
          additionCount: parseInt(addition.additionCount || 0, 10), // 총 부가상품 건수
          comProdCnt // 결합상품
        };
      });
    }

    const command = this.type === 3 ? API_CMD.BFF_05_0166 : API_CMD.BFF_05_0161;
    return this.apiService.request(command, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // feePlanProd -> 가입요금제정보
        return resp.result;
      }
      // error
      return null;
    });
  }

  _wirelessAdditions(svcInfo: any): Observable<any> {
    const {svcAttrCd} = svcInfo;
    if (SVC_CDGROUP.WIRELESS.indexOf(svcAttrCd) === -1) { // 무선이 아닌 경우 (유선 및 기타)
      return Observable.of({ count: 0 });
    }
    return Observable.zip(
        this.apiService.request(API_CMD.BFF_05_0137, {}),
        this.apiService.request(API_CMD.BFF_10_0185, {}, {
          svcMgmtNum: svcInfo.svcMgmtNum,
          svcNum: svcInfo.svcNum,
          custNum: svcInfo.custNum
        }),
        (...resps) => {
          const apiError = resps.find(resp => (resp && !!resp.code && resp.code !== '00'));
          if (!FormatHelper.isEmpty(apiError)) {
            return {
              msg: apiError.msg,
              code: apiError.code
            };
          }
          const [additionProds = {}, smartCallPickProds] = resps.map(resp => resp.result);
          let joined = additionProds.addProdList || [];
          const smartCallPick = smartCallPickProds.listSmartPick;
          // 부가상품에 스마트콜Pick이 있는 경우
          if (smartCallPick.length) {
            if (joined.length) {
              /*
              if (joined.filter(item => item.prodId === 'NA00006399').length > 0) {
                // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
                // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
                smartCallPick.forEach((product: any) => {
                  const smtCpItemIdx = joined.findIndex(prod => prod.prodId === product.prod_id);
                  if (smtCpItemIdx > -1) {
                    joined.splice(smtCpItemIdx, 1);
                  }
                });
              }
              */
              joined = joined.filter(prodJoined => {
                const prodIdJoined = prodJoined.prodId;
                // if (prodIdJoined === 'NA00006399') {
                  return !smartCallPick.find(prodSmartCallPick => (prodIdJoined === prodSmartCallPick.prod_id));
                // }
                // return true;
              });
            }
          }
          return { count: joined.length };
        });
  }

  // 나의 가입정보_약정할부 정보
  _getInstallmentInfo() {
    if (this.type === 2) {
      // 무선인 경우에만 처리
      return Observable.of(null);
    }
    // [DV001-14401] 성능개선으로 API 주소 변경함 (버전 변경됨 v1 -> v2)
    return this.apiService.request(API_CMD.BFF_05_0155, {}, null, [], API_VERSION.V2).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return null;
    });
  }

  // 무약정플랜
  _getContractPlanPoint() {
    return this.apiService.request(API_CMD.BFF_05_0175, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return null;
    });
  }
  // 번호변경 안내 서비스
  _getChangeNumInfoService() {
    if (this.type === 2) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0180, {}).map((resp) => {
      const {code} = resp;
      if (code === API_CODE.CODE_00) {
        return resp;
      }
      const result = {
        MOD0030: NEW_NUMBER_MSG.MOD0030,
        MOD0031: NEW_NUMBER_MSG.MOD0031
      };
      return {
        code,
        msg: result[code]
      };
    });
  }

  /**
   * 다른 페이지를 찾고 계신가요 통계코드 생성
   * @param data
   */
  getXtEid(data: any): any {
    const eid = {
      guide: 'CMMA_A3_B13-11',    // 요금 안내서
      hotdata: 'CMMA_A3_B13-12',    // 실시간 잔여량
      myBenefit: 'CMMA_A3_B13-13',    // 나의 혜택/할인
      combiDiscount: 'CMMA_A3_B13-14',    // 결합할인
      alarm: 'CMMA_A3_B13-15',    // 요금제 변경 가능일 알림
      manage: 'CMMA_A3_B13-16',    // 회원정보
      certificates: 'CMMA_A3_B13-17'     // 공인인증센터 *Mobile web 비노출
    };

    if (data.svcInfo.svcAttrCd === SVC_ATTR_E.PPS) {
      Object.assign(eid, {
        manage: 'CMMA_A3_B13-18',  // 회원정보
        benefit: 'CMMA_A3_B13-19',  // 혜택/할인
        mobileplan: 'CMMA_A3_B13-20'   // 요금제
      });
    } else if (SVC_CDGROUP.WIRE.indexOf(data.svcInfo.svcAttrCd) > -1) {
      Object.assign(eid, {
        discountrefund: 'CMMA_A3_B13-21',  // 할인 반환금 조회
        gifts: 'CMMA_A3_B13-22',  // 사은품 조회
        guide: 'CMMA_A3_B13-23',  // 요금 안내서
        combiDiscount: 'CMMA_A3_B13-24',  // 결합할인
        serviceArea: 'CMMA_A3_B13-25',  // 서비스 가능지역 조회
        manage: 'CMMA_A3_B13-26',  // 회원정보
        wireplan: 'CMMA_A3_B13-27'   // 인터넷/전화/IPTV
      });
    }

    data.xtEid = eid;
  };
}


export default MyTJoinSubmainController;
