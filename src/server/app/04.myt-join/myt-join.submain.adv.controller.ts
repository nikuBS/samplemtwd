/*
 * @file myt-join.submain.adv.controller.ts
 * @author Kim InHwan
 * @since 2021-01-19
 *
 */

import { NextFunction, Request, Response } from 'express';
import MyTJoinSubmainController from './myt-join.submain.controller';
import { API_CMD, API_CODE, API_VERSION, SESSION_CMD } from '../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../utils/format.helper';
import BrowserHelper from '../../utils/browser.helper';
import DateHelper from '../../utils/date.helper';
import { LOGIN_TYPE, MEMBERSHIP_GROUP } from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';

class MyTJoinSubmainAdvController extends MyTJoinSubmainController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    if ( pageInfo.advancement ) {
      // local 테스트틀 하기 위해 추가
      if ( (process.env.NODE_ENV === pageInfo.advancement.env && pageInfo.advancement.visible)
        || process.env.NODE_ENV === 'local' ) {
        this._render(req, res, next, svcInfo, allSvc, child, pageInfo);
        return false;
      }
    }
    // 기존 가입정보 화면
    super._render(req, res, next, svcInfo, allSvc, child, pageInfo);
  }

  _render(req, res, next, svcInfo, allSvc, child, pageInfo) {
    const data = this._setData(req, res, next, svcInfo, allSvc, child, pageInfo);
    data.isIos = BrowserHelper.isIos(req);
    data.isEasyLogin = svcInfo.loginType === LOGIN_TYPE.EASY;
    // R: 일반법인, E:SWING 기준 법인, D: SKT 법인
    data.isComLine = svcInfo.svcGr === 'R' || svcInfo.svcGr === 'E' || svcInfo.svcGr === 'D';
    // 간편로그인 경우 미노출 처리 필요
    if ( svcInfo.loginType !== 'S' ) {
      data.childLine = this.type === 0 && child && child.length ? ((items) => {
        return items.map((item) => {
          return {
            // 펜네임 또는 단말기 명 없는 경우 '휴대폰' 으로 노출
            nickNm: item.eqpMdlNm || '휴대폰',
            svcNum: StringHelper.phoneStringToDash(item.svcNum),
            svcMgmtNum: item.svcMgmtNum
          };
        });
      })(child) : null;
    }
    this._requestApiAfterRender(res, data);
  }

  _requestApiAfterRender(res, data) {
    const requestApiList = this._requestApiList(data.svcInfo);
    Observable.combineLatest(
      requestApiList
    ).subscribe(([myline, myif, myhs, myap, mycpp, myinsp, myps, mylps, numSvc, wlap,
                   myjinfo, prodDisInfo, benefitInfo, billInfo, membership, sms]) => {
      const responses = [myline, myif, myhs, myap, mycpp, myinsp,
        myps, mylps, numSvc, wlap];
      const newResponses = [myjinfo, prodDisInfo, benefitInfo, billInfo, membership, sms];
      const _parsing = this.__parsingRequestData({
        res, responses, data
      });
      if ( _parsing ) {
        // 신규 API 추가로 인하여 구조 변경이 필요하여 함수로 분리 후 처리
        this.__newParsingRequestData({
          res, responses: newResponses, data
        });
        // 다른 페이지를 찾고 계신가요 통계코드 추가
        data.otherMenuListTemp = this.otherMenuList(data);
        data.xtCode = this.getXtractorCode();
        res.render('myt-join.submain.adv.html', { data });
      }
    });
  }

  __newParsingRequestData(parsingInfo) {
    const { res, responses, data } = parsingInfo;
    const [myjinfo, mydisinfo, benefitInfo, billInfo, membership, sms] = responses;
    // 가입개통정보
    data.myJoinInfo = myjinfo;
    // 개통/변경이력 마지막 정보
    if ( data.myHistory && data.myHistory.length ) {
      // list 내 가장 첫번째가 최근항목 - 상용데이터로 확인
      data.myLastestHistory = {
        type: data.myHistory[0].chgCd,
        date: FormatHelper.replaceDateMasking(data.myHistory[0].chgDt)
      };
    }
    // 약정 및 단말 상환 정보
    if ( mydisinfo ) {
      data.myDeviceInstallment = mydisinfo.deviceIntallment;
      data.myDiscountInfo = mydisinfo.prodDisInfo;
    }
    // 나의 요금제 및 부가상품
    if ( data.isAddProduct ) {
      // 요금제 정보
      if ( data.myAddProduct.feePlanProd ) {
        Object.keys(data.myAddProduct.feePlanProd).forEach(key => {
          const value = data.myAddProduct.feePlanProd[key];
          if ( key === 'svcScrbDt' || key === 'scrbDt' ) {
            data.myAddProduct.feePlanProd[key] =
              DateHelper.getShortDateWithFormat(value || new Date(), 'YYYY.M.D.');
          }
          if ( key === 'basFeeTxt' || key === 'basFeeAmt' ) {
            data.myAddProduct.feePlanProd[key] = FormatHelper.addComma(value || 0);
            // '상세참조' 문구가 넘어오는 case로 인해 구분
            if ( FormatHelper.isNumber(value) ) {
              data.myAddProduct.feePlanProd[key] += '원';
            }
          }
        });
        // 유형별로 서비스 노출 항목 구분 필요
        if ( this.type === 2 ) {
          data.myAddProduct.inVisibleDisProd = true;
        } else if ( this.type === 1 ) {
          data.myAddProduct.inVisibleDisProd = true;
          data.myAddProduct.inVisibleComProd = true;
        } else if ( this.type === 3 ) {
          data.myAddProduct.inVisibleComProd = true;
        }
      }
    }
    // 나의 혜택 할인 및 멤버십 정보
    data.membership = membership;
    if ( benefitInfo ) {
      data.benefitCount = benefitInfo.count;
    }
    // 납부/청구
    if ( billInfo ) {
      if ( this.type === 1 ) {
        // PPS 인 경우
        data.paidBillInfo = billInfo.dataOnlyYn === 'Y' ?
          FormatHelper.convDataFormat(billInfo.prodAmt, 'MB') : {
            data: FormatHelper.addComma(billInfo.prodAmt),
            unit: '원'
          };
      } else {
        data.paidBillInfo = {
          amount: FormatHelper.addComma(billInfo.amt),
          showMonth: DateHelper.getAddDays(billInfo.invDt, 1, 'M월'),
          startDate: DateHelper.getShortFirstDate(billInfo.invDt),
          endDate: DateHelper.getShortLastDate(billInfo.invDt),
          isBroadBand: data.svcInfo.actCoClCd === 'B',
          isUsageBill: !(data.svcInfo.actRepYn === 'Y')
        };
      }
    }

    // 망 알림 정보
    if ( sms ) {
      data.smsInfo = sms;
    }

    if ( this.type === 2 ) {
      // 유선인 경우 일시정지/해제 버튼 무조건 노출
      data.myWirePauseState = true;
    }
    // 납부/청구 유형
    if ( data.myInfo && data.myInfo.billTypeCd ) {
      data.paymentInfo = {
        billTypeNm: data.myInfo.billTypeNm,
        // 대표청구회선이 아닌 경우에는 "통합청구"로 노출
        payMthdNm: data.svcInfo.actRepYn !== 'Y'? '통합청구' : data.myInfo.payMthdNm
      };
    }
  }

  _requestApiList(svcInfo) {
    return [
      this._getMyLine(),
      this._getMyInfo(),
      this._getMyHistory(),
      this._getAddtionalAdvProduct(),
      this._getContractPlanPoint(),
      this._getInstallmentInfo(),
      this._getPausedState(),
      this._getLongPausedState(),
      this._getChangeNumInfoService(),
      this._wirelessAdditions(svcInfo),
      this._getMyMobileJoinInfo(svcInfo),
      this._getProductDiscountInfo(),
      this._getBenefitInfo(),
      this._getBillInfo(svcInfo),
      this._getMembershipInfo(),
      this._getWireSmsInfo()
    ];
  }

  /**
   * 개통정보 조회
   * @param svcInfo
   */
  _getMyMobileJoinInfo(svcInfo) {
    if ( this.type === 2 ) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0216, {
      svcNum: svcInfo.svcNum
    }).map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
  }

  /**
   * 무선 회선인 경우 기존 05_0161로 요청 (AS-IS 영향도 없도록 처리)
   */
  _getAddtionalAdvProduct() {
    // 유선과 나머지 회선 구분하여 BFF 호출
    if ( this.type === 2 ) { // 유선회선일때
      return Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_05_0179, {}), // 부가상품 갯수 조회
        this.apiService.request(API_CMD.BFF_05_0133, {}) // 유선 결합상품 조회. BFF 매핑 등록하기
      ).map(([additionResp, combinationsResp]) => {
        const addition = additionResp.code === API_CODE.CODE_00 ? additionResp.result : null;
        const combinations = combinationsResp.code === API_CODE.CODE_00 ? combinationsResp.result : null;
        const comProdCnt = combinations.combinationMemberCnt ?
          parseInt(combinations.combinationMemberCnt || 0, 10) : combinations.combinationMemberList ?
            combinations.combinationMemberList.length : 0;
        return {
          feePlanProd: addition.feePlanProd || null,
          addProdPayCnt: parseInt(addition.payAdditionCount || 0, 10), // 유료 부가상품
          addProdPayFreeCnt: parseInt(addition.freeAdditionCount || 0, 10), // 무료 부가상품
          additionCount: parseInt(addition.additionCount || 0, 10), // 총 부가상품 건수
          comProdCnt // 결합상품
        };
      });
    }

    return this.apiService.request(API_CMD.BFF_05_0161, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        // feePlanProd -> 가입요금제정보
        return resp.result;
      }
      // error
      return null;
    });
  }

  /**
   * 약정할인 및 단말분할상환정보 V2
   */
  _getProductDiscountInfo() {
    if ( this.type === 2 ) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2)
      .map(resp => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const responseResult = resp.result;
          const prodDisList: any = [];
          const deviceIntallment: any = [];
          // 약정할인정보
          if ( !FormatHelper.isEmpty(responseResult.priceList) ) {
            prodDisList.push(...responseResult.priceList.sort((cur, next) => {
              const curStartDate = parseInt(cur.agrmtDcStaDt, 10);
              const nextStartDate = parseInt(next.agrmtDcStaDt, 10);
              return nextStartDate - curStartDate;
            }).map((item, index) => {
              if ( index === 0 ) {
                return {
                  name: item.disProdNm.slice(0, item.disProdNm.indexOf('(')).trim(),
                  startDate: item.agrmtDcStaDt,
                  endDate: item.agrmtDcEndDt
                };
              }
            }));
          }
          // 태블릿 약정
          if ( !FormatHelper.isEmpty(responseResult.tablet) ) {
            prodDisList.push({
              name: '태블릿약정할인',
              startDate: responseResult.tablet.agrmtDcStaDt,
              endDate: responseResult.tablet.agrmtDcEndDt
            });
          }
          // T 지원금 약정
          if ( !FormatHelper.isEmpty(responseResult.tAgree) ) {
            prodDisList.push({
              name: 'T지원금약정',
              startDate: responseResult.tAgree.staDt,
              endDate: responseResult.tAgree.agrmtTermDt
            });
          }
          // T약정 할부지원
          if ( !FormatHelper.isEmpty(responseResult.tInstallment) ) {
            prodDisList.push({
              name: 'T약정 할부지원',
              startDate: responseResult.tInstallment.tInstallmentOpDt,
              endDate: null,
              months: responseResult.tInstallment.allotMthCnt
            });
          }
          // 약정 위약금2
          if ( !FormatHelper.isEmpty(responseResult.rsvPenTAgree) ) {
            prodDisList.push({
              name: '약정 위약금2',
              startDate: responseResult.rsvPenTAgree.astamtOpDt,
              endDate: responseResult.rsvPenTAgree.rtenAgrmtEndDt
            });
          }
          // T 렌탈 - 사용이 필요하면 주석 제거
          // if (!FormatHelper.isEmpty(prodDisInfo.tRental)) {
          // 	prodDisList.push({
          // 		name: 'T렌탈',
          // 		startDate: prodDisInfo.tRental.rentalStaDt,
          // 		endDate: prodDisInfo.tRental.allotEndSchdDt
          // 	});
          // }
          const prodDisInfo = prodDisList.sort((cur, next) => {
            const curStartDate = parseInt(cur.startDate, 10);
            const nextStartDate = parseInt(next.startDate, 10);
            return nextStartDate - curStartDate;
          }).map((item, index) => {
            if ( index === 0 ) {
              const curDate = DateHelper.getCurrentShortDate();
              const startDate = DateHelper.getShortDate(item.startDate);
              const endDate = DateHelper.getShortDate(item.endDate);
              const totDate = DateHelper.getDiffByUnit(item.endDate, item.startDate, 'day') + 1;  // 전체 일수(첫날 포함)
              const ingDate = DateHelper.getDiffByUnit(curDate, item.startDate, 'day');  // 진행 일수(첫날 미포함, 잔여일수 계산을 위해)
              const remainDate = totDate - ingDate; // 잔여일수
              const percentage = Math.min(100, Math.floor((ingDate / totDate) * 100));
              const graphPercent = percentage < 0 ? 0 : percentage > 100 ? 100 : percentage;
              return {
                name: item.name,
                startDate,
                endDate,
                remainDate,
                graphPercent
              };
            }
          });
          // 단말상환정보
          if ( !FormatHelper.isEmpty(responseResult.installmentList) ) {
            deviceIntallment.push(...responseResult.installmentList.sort((cur, next) => {
              const curStartDate = parseInt(cur.allotStaDt, 10);
              const nextStartDate = parseInt(next.allotStaDt, 10);
              return nextStartDate - curStartDate;
            }).map((item, index) => {
              if ( index === 0 ) {
                return {
                  name: item.eqpMdlNm,
                  invRmn: item.invRmn,
                  invBamt: FormatHelper.addComma(item.invBamt)
                };
              }
            }));
          }
          return {
            deviceIntallment: deviceIntallment.length ? deviceIntallment[0] : null,
            prodDisInfo: prodDisInfo.length ? prodDisInfo[0] : null
          };
        }
        return null;
      });
  }

  /**
   * 요금,결합,혜택 정보 (멤버십카드)
   * API 에러 발생 시 별도의 에러 처리 없이 처리
   */
  _getBenefitInfo() {
    if ( this.type === 2 ) {
      return Observable.of(null);
    }
    return Observable.combineLatest(
      this.apiService.requestStore(SESSION_CMD.BFF_05_0106, {}),
      this.apiService.requestStore(SESSION_CMD.BFF_05_0094, {})
    ).map(([discountResp, combinationResp]) => {
      let benefitDiscount = 0;
      if ( discountResp.code === API_CODE.CODE_00 ) {
        // 요금할인
        benefitDiscount += discountResp.result.priceAgrmtList.length;
        // 클럽
        benefitDiscount += discountResp.result.clubYN ? 1 : 0;
        // 척척
        benefitDiscount += discountResp.result.chucchuc ? 1 : 0;
        // T끼리플러스
        benefitDiscount += discountResp.result.tplus ? 1 : 0;
        // 요금할인- 복지고객
        benefitDiscount += (discountResp.result.wlfCustDcList && discountResp.result.wlfCustDcList.length > 0) ?
          discountResp.result.wlfCustDcList.length : 0;
        // 특화 혜택
        benefitDiscount += discountResp.result.thigh5 ? 1 : 0;
        benefitDiscount += discountResp.result.kdbthigh5 ? 1 : 0;
        // 데이터 선물
        benefitDiscount += (discountResp.result.dataGiftYN) ? 1 : 0;
        // 장기가입 요금
        benefitDiscount += (discountResp.result.dcList && discountResp.result.dcList.length > 0) ?
          discountResp.result.dcList.length : 0;
        // 쿠폰
        benefitDiscount += (discountResp.result.benfList && discountResp.result.benfList.length > 0) ? 1 : 0;
      } else {
        this.logger.error(this, JSON.stringify(discountResp));
      }
      // 결합할인
      if ( combinationResp.code === API_CODE.CODE_00 ) {
        if ( combinationResp.result.prodNm.trim().length > 0 ) {
          benefitDiscount += Number(combinationResp.result.etcCnt) + 1;
        }
      } else {
        this.logger.error(this, JSON.stringify(combinationResp));
      }
      return {
        count: benefitDiscount
      };
    });
  }

  /**
   * 요금카드 (청구, 이용), PPS 인 경우 잔액 조회
   * @param svcInfo
   */
  _getBillInfo(svcInfo) {
    let cmd = svcInfo.actRepYn === 'Y' ? API_CMD.BFF_04_0009 : API_CMD.BFF_04_0008;
    if ( this.type === 1 ) {
      cmd = API_CMD.BFF_05_0013;
    }
    return this.apiService.request(cmd, {})
      .map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
  }

  /**
   * 멤버십카드
   */
  _getMembershipInfo() {
    return this.apiService.request(API_CMD.BFF_11_0001, {})
      .map(resp => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return {
            grade: MEMBERSHIP_GROUP[resp.result.mbrGrCd].toUpperCase(),
            point: FormatHelper.addComma(resp.result.mbrUsepowerdAmt || '0'),
            used: 0 // 가입한 경우
          };
        }
        if ( resp.code === 'MBR0008' ) {
          return {
            grade: '간편로그인 조회불가',
            point: '-',
            used: 2 // 간편로그인으로 조회 불가
          };
        }
        // 미 소지 케이스에 대해 정의가 없어 간편로그인 및 정상 조회 외 케이스는 가입하기로 노출
        // if (resp.code === 'MBR0001' || resp.code === 'MBR0001') {}
        return {
          grade: '가입하기',
          point: '-',
          used: 1 // 미 가입한 경우 (미소지)
        };
      });
  }

  /**
   * BFF_05_0068 + BFF_05_0058 TP 통합건
   */
  _getMyInfo() {
    return this.apiService.request(API_CMD.BFF_05_0237, {})
      .map(resp => resp.code === API_CODE.CODE_00 ? resp.result : { info: resp });
  }

  /**
   * 유선(인터넷,IPTV,집전화) 가입정보 (BFF_05_0237로 인해 수정이 필요하여 처리)
   * @param data
   * @private
   */
  _convertWireInfo(data) {
    return Object.assign(data, {
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
    });
  }

  /**
   * 유선인 경우 SMS 정보 조회
   */
  _getWireSmsInfo() {
    if ( this.type !== 2 ) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0092, {})
      .map(resp => resp.code === API_CODE.CODE_00 || resp.code === 'MOD0040' ? resp.result : null);
  }

  /**
   * 다른메뉴 템플릿
   */
  otherMenuList(data) {
    // event로 별도 처리 되는 경우 url 내 data-id 속성으로 하여 별도로 관리 필요
    if ( this.type === 2 ) {
      const tempList = [
        {
          name: '나의 데이터/통화', url: '/myt-data/submain',
          xt_eid: 'CMMA_A3_B13-93', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '요금안내서', url: '/myt-fare/billguide/guide',
          xt_eid: 'CMMA_A3_B13-94', icon: 'sub-ben-ico06.svg'
        },
        {
          name: '할인 반환금 조회', url: '/myt-join/submain/wire/discountrefund',
          xt_eid: 'CMMA_A3_B13-79', icon: 'sub-ben-ico18.svg'
        },
        {
          name: '사은품 조회', url: '/myt-join/submain/wire/gifts',
          xt_eid: 'CMMA_A3_B13-80', icon: 'sub-ben-ico19.svg'
        },
        {
          name: '서비스 가능지역 조회', url: '/product/wireplan/service-area',
          xt_eid: 'CMMA_A3_B13-81', icon: 'sub-ben-ico14.svg'
        },
        {
          name: '회원정보', url: '/common/member/manage',
          xt_eid: 'CMMA_A3_B13-95', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '내게 맞는 결합상품 찾기', url: '/product/wireplan',
          xt_eid: 'CMMA_A3_B13-82', icon: 'submain-ico07.svg'
        }
      ];
      if ( data.svcInfo.svcAttrCd === 'S2' ) {
        // 인터넷/전화 외 회선 인 경우에는 나의 데이터/통화 항목 미노출
        tempList.splice(0, 1);
      }
      return tempList;
    } else if ( this.type === 1 ) {
      return [
        {
          name: '나의 데이터/통화', url: '/myt-data/submain',
          xt_eid: 'CMMA_A3_B13-103', icon: 'submain-ico16.svg'
        },
        {
          name: '요금안내서', url: '/myt-fare/billguide/guide',
          xt_eid: 'CMMA_A3_B13-104', icon: 'sub-ben-ico06.svg'
        },
        {
          name: '회원정보', url: '/common/member/manage',
          xt_eid: 'CMMA_A3_B13-105', icon: 'sub-ben-ico16.svg'
        }
      ];
    } else {
      const tempList = [
        {
          name: '나의 데이터/통화', url: '/myt-data/submain',
          xt_eid: 'CMMA_A3_B13-58', icon: 'submain-ico16.svg'
        },
        {
          name: '요금안내서', url: '/myt-fare/billguide/guide',
          xt_eid: 'CMMA_A3_B13-59', icon: 'sub-ben-ico06.svg'
        },
        {
          name: '실시간 잔여량', url: '/myt-data/hotdata',
          xt_eid: 'CMMA_A3_B13-60', icon: 'sub-ben-ico01.svg'
        },
        {
          name: '인증 센터', url: 'certify-popup',
          xt_eid: 'CMMA_A3_B13-61', event: true, icon: 'sub-ben-ico17.svg'
        },
        {
          name: '회원정보', url: '/common/member/manage',
          xt_eid: 'CMMA_A3_B13-62', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '소액결제', url: '/myt-fare/bill/small',
          // name: '휴대폰 결제/콘텐츠 이용료', url: '/myt-fare/bill/small',
          xt_eid: 'CMMA_A3_B13-64', icon: 'sub-ben-ico06.svg'
        }
      ];
      // 요금제 변경 가능일 알림 휴대폰 이나 PPS 인 경우에만 노출 하도록 하기 위해 기능 추가
      if ( data.type === 0 || data.type === 1 ) {
        tempList.splice(5, 0,
          {
            name: '요금제 변경 가능일 알림', url: '/myt-join/myplan/alarm',
            xt_eid: 'CMMA_A3_B13-63', icon: 'sub-ben-ico15.svg'
          });
      }
      if ( !data.isApp ) {
        // 모바일 웹인 경우 인증센터 항목 가리고 요금제 변경 위치 변경
        const certifyIndex = tempList.length === 7 ? 5 : 4;
        tempList[3] = tempList[certifyIndex];
        tempList.splice(certifyIndex, 1);
      }
      // 법인 회선 또는 포켓파이, 티로그인 인 경우 콘텐츠 이용 및 인증센터 항목 제거
      if ( data.isComLine || this.type === 3 ) {
        tempList.splice(tempList.length - 1, 1);
        if ( data.isApp ) {
          tempList.splice(tempList.length >= 5 ? 3 : 2, 1);
        } else {
          const moveIdx = tempList.length - (tempList.length === 6 ? 2 : 1);
          const target = tempList.splice(tempList.length - 1, 1)[0];
          tempList.splice(moveIdx, 0, target);
        }
      }
      return tempList;
    }
  }

  /**
   * 오퍼통계코드 (상용기준)
   */
  getXtractorCode() {
    if (this.type === 0) {
      // 무선
      return {
        moreInfo: 'CMMA_A3_B13-30',
        disInfo: 'CMMA_A3_B13-31',
        contractPlan: 'CMMA_A3_B13-32',
        usedContractPlan: 'CMMA_A3_B13-33',
        additionInfo: 'CMMA_A3_B13-34',
        freeAddition: 'CMMA_A3_B13-35',
        feeAddition: 'CMMA_A3_B13-36',
        optAddition: 'CMMA_A3_B13-37',
        comAddition: 'CMMA_A3_B13-38',
        benefitInfo: 'CMMA_A3_B13-39',
        gradeMbr: 'CMMA_A3_B13-40',
        pointMbr: 'CMMA_A3_B13-41',
        countMbr: 'CMMA_A3_B13-42',
        paidInfo: 'CMMA_A3_B13-43',
        paidInfo2: 'CMMA_A3_B13-108',
        billType: 'CMMA_A3_B13-44',
        payMthdType: 'CMMA_A3_B13-45',
        reservation: 'CMMA_A3_B13-46',
        childHotdata:'CMMA_A3_B13-47',
        childBillGuide: 'CMMA_A3_B13-48',
        childHotbill: 'CMMA_A3_B13-49',
        pause: 'CMMA_A3_B13-50',
        addPause: 'CMMA_A3_B13-51',
        detailPause: 'CMMA_A3_B13-52',
        password: 'CMMA_A3_B13-53',
        changePassword: 'CMMA_A3_B13-54',
        oldNumber: 'CMMA_A3_B13-55',
        changeNumber: 'CMMA_A3_B13-56',
        banner: 'CMMA_A3_B13-57'
      }
    } else if (this.type === 1) {
      // PPS
      return {
        additionInfo: 'CMMA_A3_B13-96',
        freeAddition: 'CMMA_A3_B13-97',
        feeAddition: 'CMMA_A3_B13-98',
        paidInfo: 'CMMA_A3_B13-106',
        paidInfo2: 'CMMA_A3_B13-83',
        reservation: 'CMMA_A3_B13-99',
        password: 'CMMA_A3_B13-100',
        changePassword: 'CMMA_A3_B13-101',
        banner: 'CMMA_A3_B13-102'
      }
    } else {
      // 유선
      return {
        untillInfo: 'CMMA_A3_B13-65',
        wireInfo: 'CMMA_A3_B13-66',
        additionInfo: 'CMMA_A3_B13-84',
        freeAddition: 'CMMA_A3_B13-85',
        feeAddition: 'CMMA_A3_B13-86',
        comAddition: 'CMMA_A3_B13-87',
        paidInfo: 'CMMA_A3_B13-88',
        paidInfo2: 'CMMA_A3_B13-107',
        billType: 'CMMA_A3_B13-89',
        payMthdType: 'CMMA_A3_B13-90',
        reservation: 'CMMA_A3_B13-91',
        pause: 'CMMA_A3_B13-67',
        workNotify: 'CMMA_A3_B13-68',
        addWorkNotify: 'CMMA_A3_B13-69',
        editWorkNotify: 'CMMA_A3_B13-70',
        bTargetInfo: 'CMMA_A3_B13-71',
        bTargetInfoDetail: 'CMMA_A3_B13-72',
        svcCancel: 'CMMA_A3_B13-73',
        addrChg: 'CMMA_A3_B13-74',
        prodChg: 'CMMA_A3_B13-75',
        instChg: 'CMMA_A3_B13-76',
        transferFee: 'CMMA_A3_B13-77',
        wireNumChange: 'CMMA_A3_B13-78'
      }
    }
  }
}

export default MyTJoinSubmainAdvController;
