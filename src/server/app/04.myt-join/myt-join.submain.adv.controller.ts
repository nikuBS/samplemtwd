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
import DateHelper from '../../utils/date.helper';
import { MEMBERSHIP_GROUP } from '../../types/bff.type';
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
    // 간편로그인 경우 미노출 처리 필요
    if (svcInfo.loginType !== 'S') {
      data.childLine = this.type === 0 && child && child.length ? ((items) => {
        return items.map((item) => {
          return {
            nickNm: item.childEqpMdNm || item.eqpMdlNm, // item.mdlName 서버데이터 확인후 변경
            svcNum: StringHelper.phoneStringToDash(item.svcNum),
            svcMgmtNum: item.svcMgmtNum
          }
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
                   myjinfo, prodDisInfo, benefitInfo, billInfo, membership, sms, wirepause, payment]) => {
      const responses = [myline, myif, myhs, myap, mycpp, myinsp,
        myps, mylps, numSvc, wlap];
      const newResponses = [myjinfo, prodDisInfo, benefitInfo, billInfo, membership,sms, wirepause, payment];
      this.__parsingRequestData({
        res, responses, data
      });
      // 신규 API 추가로 인하여 구조 변경이 필요하여 함수로 분리 후 처리
      this.__newParsingRequestData({
        res, responses: newResponses, data
      });
      // 다른 페이지를 찾고 계신가요 통계코드 추가
      data.xtdTemp = this.getXtEidTemp(data);
      res.render('myt-join.submain.adv.html', { data });
    });
  }

  __newParsingRequestData(parsingInfo) {
    const { res, responses, data } = parsingInfo;
    const [myjinfo, mydisinfo, benefitInfo, billInfo, membership, sms, wirepause, payment] = responses;
    // 가입개통정보
    data.myJoinInfo = myjinfo;
    // 개통/변경이력 마지막 정보
    if (data.myHistory && data.myHistory.length) {
      data.myLastestHistory = {
        type: data.myHistory[data.myHistory.length - 1].chgCd,
        date: FormatHelper.replaceDateMasking(data.myHistory[data.myHistory.length - 1].chgDt)
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
          if ( key === 'svcScrbDt' || key === 'scrbDt') {
            data.myAddProduct.feePlanProd[key] =
              DateHelper.getShortDateWithFormat(value || new Date(), 'YYYY.M.D.');
          }
          if ( key === 'basFeeTxt' || key === 'basFeeAmt' ) {
            data.myAddProduct.feePlanProd[key] = FormatHelper.addComma(value || 0);
          }
        });
        // 유형별로 서비스 노출 항목 구분 필요
        if (this.type === 2) {
          data.myAddProduct.inVisibleDisProd = true;
        } else if (this.type === 3 || this.type === 1) {
          data.myAddProduct.inVisibleDisProd = true;
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
      data.paidBillInfo = {
        amount: FormatHelper.addComma(billInfo.amt),
        showMonth: DateHelper.getAddDays(billInfo.invDt, 1, 'M월'),
        startDate: DateHelper.getShortFirstDate(billInfo.invDt),
        endDate: DateHelper.getShortLastDate(billInfo.invDt),
        isBroadBand: data.svcInfo.actCoClCd === 'B',
        isUsageBill: !(data.svcInfo.actRepYn === 'Y')
      };
    }

    // 망 알림 정보
    if (sms) {
      data.smsInfo = sms;
    }

    if (wirepause) {
      data.myWirePauseState = wirepause;
    }

    if ( payment ) {
      data.paymentInfo = payment;
    }
  }

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
      this._wirelessAdditions(svcInfo),
      this._getMyMobileJoinInfo(svcInfo),
      this._getProductDiscountInfo(),
      this._getBenefitInfo(),
      this._getBillInfo(svcInfo),
      this._getMembershipInfo(),
      this._getWireSmsInfo(),
      this._getWirePauseStateInfo(),
      this._getPaymentInfo()
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
1
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
              const percentage = 100 - Math.floor((ingDate / totDate) * 100);
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
   * 요금카드 (청구, 이용)
   * @param svcInfo
   */
  _getBillInfo(svcInfo) {
    const cmd = svcInfo.actRepYn === 'Y' ? API_CMD.BFF_04_0009 : API_CMD.BFF_04_0008;
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
   * 납부/청구 정보 조회
   */
  _getPaymentInfo() {
    if ( this.type === 1 ) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0058, {})
      .map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
  }

  /**
   * 유선인 경우 SMS 정보 조회
   */
  _getWireSmsInfo() {
    if (this.type !== 2) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0092, {})
      .map(resp => resp.code === API_CODE.CODE_00 || resp.code === 'MOD0040' ? resp.result : null);
  }

  /**
   * 유선인 경우에 유선 일시정지 상태
   */
  _getWirePauseStateInfo() {
    if (this.type !== 2) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0169, {})
      .map(resp => resp.code === API_CODE.CODE_00 || resp.code === 'MOD0031'? resp.result : null);
  }

  /**
   * 다른메뉴 템플릿
   */
  getXtEidTemp(data) {
    // event로 별도 처리 되는 경우 url 내 data-id 속성으로 하여 별도로 관리 필요
    if ( this.type === 2 ) {
      const tempList = [
        {
          name: '나의 데이터/통화', url: '/myt-data/submain',
          xt_eid: 'CMMA_A3_B13-56', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '요금안내서', url: '/myt-fare/billguide/guide',
          xt_eid: 'CMMA_A3_B13-57', icon: 'sub-ben-ico06.svg'
        },
        {
          name: '할인 반환금 조회', url: '/myt-join/submain/wire/discountrefund',
          xt_eid: 'CMMA_A3_B13-76', icon: 'sub-ben-ico18.svg'
        },
        {
          name: '사은품 조회', url: '/myt-join/submain/wire/gifts',
          xt_eid: 'CMMA_A3_B13-77', icon: 'sub-ben-ico19.svg'
        },
        {
          name: '서비스 가능지역 조회', url: '/product/wireplan/service-area',
          xt_eid: 'CMMA_A3_B13-78', icon: 'sub-ben-ico14.svg'
        },
        {
          name: '회원정보', url: '/common/member/manage',
          xt_eid: 'CMMA_A3_B13-60', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '내게 맞는 결합상품 찾기', url: '/product/wireplan',
          xt_eid: 'CMMA_A3_B13-79', icon: 'submain-ico07.svg'
        }
      ];
      if (data.svcInfo.svcAttrCd !== 'S1' || data.svcInfo.svcAttrCd !== 'S3') {
        // 인터넷/전화 외 회선 인 경우에는 나의 데이터/통화 항목 미노출
        tempList.splice(0, 1);
      }
      return tempList;
    } else {
      const tempList = [
        {
          name: '나의 데이터/통화', url: '/myt-data/submain',
          xt_eid: 'CMMA_A3_B13-56', icon: 'submain-ico16.svg'
        },
        {
          name: '요금안내서', url: '/myt-fare/billguide/guide',
          xt_eid: 'CMMA_A3_B13-57', icon: 'sub-ben-ico06.svg'
        },
        {
          name: '실시간 잔여량', url: '/myt-data/hotdata',
          xt_eid: 'CMMA_A3_B13-58', icon: 'sub-ben-ico01.svg'
        },
        {
          name: '인증 센터', url: 'certify-popup',
          xt_eid: 'CMMA_A3_B13-59', event: true, icon: 'sub-ben-ico17.svg'
        },
        {
          name: '회원정보', url: '/common/member/manage',
          xt_eid: 'CMMA_A3_B13-60', icon: 'sub-ben-ico16.svg'
        },
        {
          name: '요금제 변경 가능일 알림', url: '/myt-join/myplan/alarm',
          xt_eid: 'CMMA_A3_B13-61', icon: 'sub-ben-ico15.svg'
        },
        {
          name: '휴대폰 결제/콘텐츠 이용료', url: '/myt-fare/bill/small',
          xt_eid: 'CMMA_A3_B13-62', icon: 'sub-ben-ico06.svg'
        }
      ];
      if (!data.isApp) {
        // 모바일 웹인 경우 인증센터 항목 가리고 요금제 변경 위치 변경
        tempList[3] = tempList[5];
        tempList.splice(5, 1);
      }

      return tempList;
    }
  }
}


export default MyTJoinSubmainAdvController;
