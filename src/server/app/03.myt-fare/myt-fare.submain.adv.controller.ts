/**
 * MenuName: 나의 요금 > 서브메인(MF2)
 * @file myt-fare.submain.controller.ts
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @editor 양정규
 * @since 2018.09.27
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import {API_CMD, API_CODE, SESSION_CMD} from '../../types/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../types/title.type';
import {MYT_SUSPEND_MILITARY_RECEIVE_CD, MYT_SUSPEND_REASON_CODE, SVC_ATTR_NAME} from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';
// OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
import CommonHelper from '../../utils/common.helper';
import {MytFareInfoMiriService} from './services/info/myt-fare.info.miri.service';
import {MytFareSubmainGuideService} from './services/submain/myt-fare.submain.guide.service';
import {MytFareSubmainSmallService} from './services/submain/myt-fare.submain.small.service';
import moment from 'moment';
import {MytFareSubmainChildService} from './services/submain/myt-fare.submain.child.service';
import {MytFareSubmainMyBenefitService} from './services/submain/myt-fare.submain.my-benefit.service';
import {MYT_FARE_BILL_TYPE, MYT_SUSPEND_STATE_EXCLUDE} from '../../types/string.type';

interface Info {
  req: Request;
  svcInfo: any;
  childInfo: any;
  pageInfo: any;
}

export default class MyTFareSubmainAdvController extends TwViewController {
  private _miriService!: MytFareInfoMiriService;
  private _mytFareSubmainGuideService!: MytFareSubmainGuideService;
  private _smallService!: MytFareSubmainSmallService;
  private _childService!: MytFareSubmainChildService;
  private _benefitService!: MytFareSubmainMyBenefitService;
  private _info;

  private get info(): Info {
    return this._info;
  }

  private set info(value: Info) {
    this._info = value;
  }
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // "지난달"의 마지막 일자 가져오기
    req.query.date = req.query.date || DateHelper.getEndOfMonSubtractDate(new Date(), '1', 'YYYYMMDD');
    this.info = {
      req,
      svcInfo,
      childInfo,
      pageInfo
    };
    this.apiService.setTimeout(5000); // 타임아웃 5초 설정
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo);
    this._mytFareSubmainGuideService = new MytFareSubmainGuideService(req, res, svcInfo, allSvc, childInfo, pageInfo);
    this._smallService = new MytFareSubmainSmallService(req, res, svcInfo);
    this._childService = new MytFareSubmainChildService(req, res, svcInfo, allSvc, childInfo, pageInfo);
    this._benefitService = new MytFareSubmainMyBenefitService(req, res, svcInfo);
    const BLOCK_ON_FIRST_DAY = false;
    const data: any = {
      svcInfo: Object.assign({}, svcInfo),
      pageInfo,
      isMicroPayment: false, // 소액결제 버튼 노출 여부
      isNotAutoPayment: true, // 납부청구 관련 버튼 노출 여부
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      isNotFirstDate: (new Date().getDate() > 1) || !BLOCK_ON_FIRST_DAY, // 1일 기준
      // 휴대폰, T-PocketFi 인 경우에만 실시간 요금 조회 노출
      isRealTime: (['M1', 'M3'].indexOf(svcInfo.svcAttrCd) > -1),
      childLineInfo: childInfo // [OP002-3317] 자녀 요금조회
    };

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    CommonHelper.addCurLineInfo(data.svcInfo);

    // 상태값 참조 : http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=53477532
    // 10: 신청/60: 초기화 -> 비밀번호 설정 유도
    // 20: 사용중/21:신청+등록완료 -> 회선 변경 시 비번 입력 필요, 비밀번호 변경 가능
    // 30: 변경
    // 70: 비밀번호 잠김 -> 지점에서만 초기화 가능
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분
    // 비밀번호 사용중 및 등록완료인 상태에서만 노출
    const {pwdStCd, svcAttrCd} = svcInfo;
    if (svcAttrCd.indexOf('S') === -1 && ['20', '21', '30'].indexOf(pwdStCd) > -1) {
      data.isPwdSt = true;
    }

    try {
      this.getRquests(data, res).subscribe( resp => {
        /*if ( data.billError && data.isPPS) {
          return this.errorRender(res, data.billError);
        }*/
        res.render('myt-fare.submain.adv.html', { data: resp });
      });

    } catch (e) {
      throw new Error(e);
    }
  }

  private getRquests(data: any, res: any): Observable<any> {
    const svcInfo = data.svcInfo;

    const reqs = new Array<Observable<any>>();
    reqs.push(this.getSubmain(data)); // as is 나의요금
    reqs.push(this.getBillCharge(svcInfo, res)); // 요금 안내서

    // 회선이 휴대폰 인 경우만
    if (svcInfo.svcAttrCd === 'M1') {
      reqs.push(this._smallService.getHistory()); // 소액결제, 콘텐츠 이용료
      reqs.push(this._benefitService.getBenefit()); // 나의 혜택/할인
      reqs.push(this.getSearchReq()); // 일시정지/해제, 장기 일시정지
    }

    return Observable.combineLatest(
      reqs
    ).map( (responses) => {
      const [submain, guide, ...other] = responses;
      const error = submain.code ? submain : guide.code ? guide : null;
      if (error) {
        data.billError = {
          code: error.code,
          msg: error.msg
        };
      }

      const [small, benefit, pause] = other || [{}, {}, {}];
      Object.assign(data, {
        guide,
        small,
        benefit,
        pause
      });

      return data;
    });
  }

  private getSubmain(data: any): Observable<any> {
    const date = this.info.req.query.date,
      nowDate = new Date();
    const prevDate = DateHelper.getEndOfMonSubtractDate(nowDate, '1', 'YYYYMMDD');

    // data.claimDt = date;
    // data.month = this._mytFareSubmainGuideService.getMonth(date, 'M');
    data.claimFirstDay = DateHelper.getShortFirstDate(date);
    // data.claimLastDay = DateHelper.getShortLastDate(date);
    // data.claimPay = '0';
    data.totalClaim = '0';
    data.latestDates = [];

    const {svcInfo} = data;
    // PPS(선불폰) 인 경우
    if ( svcInfo.svcAttrCd === 'M2' ) {
      data.type = 'UF';
      data.isNotAutoPayment = false;
      data.isRealTime = false;
      data.isPPS = true;
      return Observable.of(data);
    }
    // [DV001-15583] Broadband 인 경우에 대한 예외처리 수정
    if ( svcInfo.actCoClCd === 'B' ) {
      data.type = 'UF';
      data.isBroadBand = true;
    }
    // 선택월이 당월이면서 1일~4일 에는 청구요금 영역 미노출함. 유선: 6일, 무선 : 5일
    const limitDate = svcInfo.svcAttrCd.indexOf('S') > -1 ? 6 : 5;
    if (date === prevDate && nowDate.getDate() < limitDate) {
      data.isNotClaimData = true;
    }

    return this._requestClaim(data);
  }

  private getBillCharge(svcInfo, res): Observable<any> {
    return this._mytFareSubmainGuideService.getBillCharge(svcInfo, res).switchMap( resp => {
      if (resp.code && resp.code !== API_CODE.CODE_00) {
        return Observable.of({
          code: resp.code,
          msg: resp.msg
        });
      }

      return this._childService.getChildBillInfo().map( childInfo => {
        resp.childInfo = childInfo;
        return resp;
      });

    });
  }

  /**
   * 청구요금 조회
   * @param data :Object
   * @private
   */
  private _requestClaim(data: any): Observable<any> {
    const {svcInfo} = data;
    let isRep = svcInfo.actRepYn === 'Y'; // 대표청구 여부

    const request = (isNormal?: boolean) => {
      isRep = isNormal !== undefined ? !isNormal : isRep;
      let reqs = new Array<Observable<any>>();
      const commonReqs = new Array<Observable<any>>();
      commonReqs.push(this._getPaymentInfo());
      commonReqs.push(this._getAffiliateCard());
      commonReqs.push(this._miriService.getMiriBalance());
      // 대표청구일 때
      if (isRep) {
        reqs.push(this._getNonPayment());
        reqs.push(this._getAutoPayment());
      } else {
        data.type = 'UF';
        reqs.push(this._getUsageFee());
      }
      reqs = commonReqs.concat(reqs);
      return Observable.combineLatest(
        reqs
      ).switchMap((responses) => {
        const [paymentInfo, affiliateCard, miriBalance] = responses.splice(0, commonReqs.length);
        // 납부/청구 정보
        data.paymentInfo = paymentInfo;
        // 제휴카드 정보
        if (affiliateCard) {
          data.isShowAffiliateCard = affiliateCard.join_card_yn === 'N' && affiliateCard.pay_mthd_cd === '02';
        }
        data.miriBalance = miriBalance; // 미리납부 금액 잔액

        // 대표청구일 때
        if (isRep) {
          const [nonpayment, autoPayment] = responses;
          if ( nonpayment ) {
            const unPaidTotSum = nonpayment.unPaidTotSum || '0';
            data.nonpayment = nonpayment;
            data.unPaidTotSum = unPaidTotSum !== '0' ? FormatHelper.addComma(unPaidTotSum) : null;
          }

          // 자동납부 정보
          if (autoPayment) {
            data.autoPayment = autoPayment;
          }

          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1 ) {
            svcInfo.nickNm = SVC_ATTR_NAME[svcInfo.svcAttrCd];
          }
        } else { // 대표 청구가 아닐때
          const [usage] = responses;
          const {info} = usage;
          if ( usage && info ) {
            const {code, msg} = info;
            // 오류code 처리
            return Observable.of({
              code: code,
              msg: msg
            });
          }
          // 사용요금
          data.usage = usage;
          // PocketFi or T Login 인 경우 이용요금자세히버튼 노출
          if ( ['M3', 'M4'].indexOf(data.svcInfo.svcAttrCd) > -1 ) {
            data.isNotAutoPayment = false;
          }
        }

        return this.getClaimDate(data);
      });
    };

    // 대표청구일 때
    if (isRep) {
      return this.apiService.request(API_CMD.BFF_05_0203, {}).switchMap((resp) => {
        if ( resp.code !== API_CODE.CODE_00 ) {
          // SKB(청구대표회선)인 경우
          if ( resp.code === 'BIL0011' ) {
            data.isBroadBand = true;
            return request(true);
          }
          // 오류code 처리
          return Observable.of({
            code: resp.code,
            msg: resp.msg
          });
        }

        // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
        if (FormatHelper.isEmpty((resp.result || {}).invDt)) {
          return Observable.of({
            code: API_CODE.CODE_500,
            msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA
          });
        }
        data.claim = resp.result;
        return request();
      });
    }
    return request();
  }

  /**
   * @desc 청구 월, 기간 구하기
   * @private
   */
  private getClaimDate(data: any): any {
    const date = this.info.req.query.date, svcInfo = this.info.svcInfo;
    let isRep = svcInfo.actRepYn === 'Y'; // 대표청구 여부
    isRep = data.isBroadBand ? false : isRep;
    const claim = isRep ? data.claim : data.usage;
    const latestDates = new Array<string>();  // 최근 청구월(최대 6개월이며, 내역이 2개만 있다면 2개만 생성됨)
    const amtList = (isRep ? claim.billInvAmtList : claim.usedAmtList) || [];
    const toDate = new Date();
    const eDate = DateHelper.getEndOfMonSubtractDate(toDate, '1', 'YYYYMMDD');
    const sDate = DateHelper.getEndOfMonSubtractDate(eDate, '5', 'YYYYMMDD');
    const getMonth = (_date, _format) => {
      return this._mytFareSubmainGuideService.getMonth(_date, _format);
    };

    const setClaimData = (item) => {
      data.claimPay = item.invAmt || '0';
      data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(claim.dcAmt))).toString() );
      data.claimDt = item.invDt;
      data.month = getMonth(item.invDt, 'M');
      data.claimLastDay = DateHelper.getShortDate(item.invDt);
    };

    amtList.map( item => {
      // 선택월의 청구금액
      if (!data.claimPay && item.invDt === date) {
        setClaimData(item);
      }

      /*
          현재월기준 최근6개월의 청구일자를 구한다.
          청구금액리스트가 최근6개월 기준이긴하나, 중지등의 사유로 청구이력이 없는경우는 그 이전의 내역이 있는 6개의 리스트를 주고있다.
          예) 현재날짜가 2020-12 인경우. 2020-06 ~ 2020-11 까지 6개월치의 청구일자를 노출해야함.
          만약, 2020-11월에 중지를 하여 청구금액이 발생하지 않는다면, BE에서 2020-05 ~ 2020-10 이렇게 내역이 있는 최근 6개월치의 데이터를 보내주고 있음.
       */
      if (DateHelper.isBetween(item.invDt, sDate, eDate)) {
        latestDates.push(item.invDt);
      }
    });

    // 선택월의 청구금액이 없는경우 배열의 첫번째가 선택월과 같은경우 해당 데이터를 세팅한다.
    if (!data.claimPay) {
      const currClaimData = amtList.find( item => getMonth(item.invDt, 'M') === getMonth(date, 'M'));
      if (currClaimData) {
        setClaimData(currClaimData);
      }
    }

    // 청구 월 리스트에 '이번달' 넣기
    // const prevLastDate = DateHelper.getEndOfMonSubtractDate(toDate, '1', 'YYYYMMDD');
    if (latestDates.length > 0 && !latestDates.some( month => getMonth(month, 'M') === DateHelper.getCurrentMonth(toDate))) {
      latestDates.splice(0, 0, eDate);
    }
    data.latestDates = latestDates;
    // 청구리스트에 당월이 없는경우 디폴트 값을 넣어준다.
    data.claimPay = data.claimPay || '0';
    data.claimDt = data.claimDt || eDate;
    data.month = data.month || DateHelper.getCurrentMonth(toDate);
    data.claimLastDay = data.claimLastDay || DateHelper.getShortDate(eDate);

    // 최근 6개월 청구내역이 없는경우, 당월 가입자인지 확인한다.
    return this.checkNewMember(data).map( resp => {
      data = resp;
      /*
          해당월 청구요금, 부분납부한 요금, 잔여납부 금액, 미납
       */
      // 청구금액
      const claimPay = this.getInt(data.claimPay) || 0;
      // 당월 납부해야할 금액
      // let remainPayment = this.getInt(data.claimPay);
      let remainPayment = 0;
      // 미납금액: 조회월의 이전 미납금액들의 sum
      let unpaid = 0;
      ((data.nonpayment || {}).unPaidAmtMonthInfoList || []).map( unpay => {
        const unPaidAmt = this.getInt(unpay.unPaidAmt);
        /*
            # 선택월 납부해야할 금액
            당월 청구금액 납부일자가 도래하지 않아 아직 납부를 안한경우 또는, 당월 청구금액 중 일부만 납부 후 남은 잔액을
            미납금액 리스트에 당월 날짜로 포함하여 주고있다.
         */
        if (unpay.unPaidInvDt === date) {
          remainPayment = unPaidAmt;
        }
        // 선택월보다 이전 미납액들의 총 합계
        // if (DateHelper.getDiffByUnit(unpay.unPaidInvDt, date, 'days') < 1) {
        if (DateHelper.isBefore(unpay.unPaidInvDt, date)) {
          unpaid += unPaidAmt;
        }
      });
      // 부분 납부한 금액: 청구금액 - 선택월 납부해야하는 금액
      const prepay = remainPayment > 0 ? this.getInt(claimPay) - remainPayment : 0;

      Object.assign(data, {
        totalClaim: this.addComma(claimPay + unpaid), // 총 납부금액 ( 청구금액 + 미납금액 )
        prepay: this.addComma(prepay), // 부분납부한 금액
        remainPayment: this.addComma(remainPayment), // 납부해야할 금액
        unpaid: this.addComma(unpaid) // 미납금액(선택월의 이전 미납금액의 합계)
      });

      const {autoPayment = {}} = data,
        payCode = autoPayment.payMthdCd,
        dateOfPayType = {
          '01': autoPayment.payCyclNm,
          '02': '',
          '03': autoPayment.mywayDrwDayCd,
          '04': autoPayment.mywayDrwDayCd
        };
      let payDate = dateOfPayType[payCode]; // 자동이체(계좌이체일때만) 예정일 또는 납부예정일
      if (payDate) {
        payDate = moment(DateHelper.convDateFormat(date)).add(1, 'days').date(payDate).format('YYYY.M.D.');
      }
      // 납부 정보
      data.autoPayment = {
        isPaid: remainPayment.toString() === '0', // 선택월 요금 납부 여부(예정(or 미납), 완료)
        // payCode,
        payDate,
        isThisMonth: getMonth(eDate, 'M') === getMonth(date, 'M') // 이번달 유무
      };
      return data;
    });
  }

  // 조회/신청 서비스
  private getSearchReq(): Observable<any> {
    return Observable.combineLatest(
      this._getPausedState(),
      this._getLongPausedState()
    ).map( ([myPausedState, myLongPausedState]) => {
      // AC: 일시정지가 아닌 상태, SP: 일시정지 중인 상태
      if (myPausedState) {
        if (myPausedState.svcStCd === 'SP') {
          const fromDt = myPausedState.fromDt, toDt = myPausedState.toDt;
          myPausedState.sDate = DateHelper.getShortDate(fromDt);
          myPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
          myPausedState.state = true;
          if (myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.MILITARY
            || myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.OVERSEAS
            || myPausedState.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.SEMI_MILITARY) {
            myLongPausedState = {
              state: true,
              opState: myPausedState.svcChgRsnNm.replace(MYT_SUSPEND_STATE_EXCLUDE, ''),
              fromDt: myPausedState.fromDt,
              toDt: myPausedState.toDt
            };
          }
        } else if (((myPausedState.armyDt && myPausedState.armyDt !== '')
          || (myPausedState.armyExtDt && myPausedState.armyExtDt !== ''))) {
          myLongPausedState = {
            state: true
          };
          myPausedState.armyDt = myPausedState.armyDt || myPausedState.armyExtDt;
        } else if (myPausedState.reservedYn === 'Y') { // 일시정지 예약자
          const fromDt = myPausedState.fromDt, toDt = myPausedState.toDt;
          myPausedState.sDate = DateHelper.getShortDate(fromDt);
          myPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
        }
      }

      if (myLongPausedState) {
        const fromDt = myLongPausedState.fromDt, toDt = myLongPausedState.toDt;
        myLongPausedState.sDate = DateHelper.getShortDate(fromDt);
        myLongPausedState.eDate = toDt && DateHelper.getShortDate(toDt); // 해외체류는 toDt 없음
        myLongPausedState.state = true;
        // 군입대로 인한 장기 일시정지
        myLongPausedState.isArmy = (MYT_SUSPEND_MILITARY_RECEIVE_CD.indexOf(myLongPausedState.receiveCd) > -1);
        if (myPausedState.svcStCd === 'AC') {
          if ((myPausedState.armyDt && myPausedState.armyDt !== '')
            || (myPausedState.armyExtDt && myPausedState.armyExtDt !== '')) {
            const days = DateHelper.getDiffByUnit(myPausedState.toDt, DateHelper.getCurrentDate(), 'days');
            if (days < 0) {
              myPausedState.state = false;
              myLongPausedState.state = false;
              delete myPausedState.armyDt;
            }
          }
          // 장기일시정지 처리완료 상태에서 멈추는 문제 해결 (장기일시정지, 처리완료, 신청일이 오늘 포함 이전이면, 새로 신청가능한 것으로
          if (myLongPausedState.opStateCd === 'C' && fromDt <= DateHelper.getCurrentShortDate()) {
            myLongPausedState.stateReleased = true;
          }
        }

        // DV001-18322 스윙 문구 고객언어 반영
        if (myLongPausedState.opState) {
          myLongPausedState.opState = myLongPausedState.opState.replace(MYT_SUSPEND_STATE_EXCLUDE, '');
        }
      }
      return {
        myPausedState,
        myLongPausedState
      };
    });
  }

  // 이번달 가입자인지 확인
  private checkNewMember(data: any): any {
    data.isNewMember = false;
    if (data.latestDates.length !== 0) {
      return Observable.of(data);
    }
    return this._getMyInfo().map( resp => {
      if (resp === null) {
        return data;
      }
      const svcCd = data.svcInfo.svcAttrCd;
      // 무선
      if (svcCd.indexOf('M') > -1) {
        const joinDate = FormatHelper.getInt(resp.scrbYrMthCnt);
        data.isNewMember = joinDate < 2;
      } else if (svcCd.indexOf('S') > -1) { // 유선
        const date = new Date();
        const joinDate = resp.joinDate || date;
        data.isNewMember = moment(joinDate).diff(date, 'month') === 0;
      }
      return data;
    });
  }

  private addComma(val: any): string {
    return FormatHelper.addComma('' + val);
  }

  private getInt(val: any): number {
    val = (val || '0').toString().replace(/[^0-9]/g, '');
    return parseInt(val, 10);
  }

  private recompare(a, b) {
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

  private compare(a, b) {
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
   * 다른 회선 항목 정리
   * @param target
   * @param items
   */
  private convertOtherLines(target, items): any {
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
          // IPTV, 인터넷 인 경우 주소표시
          if ( ['S1', 'S2'].indexOf(item.svcAttrCd) > -1 ) {
            item.svcNum = item.addr;
          } else {
            item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
          }
          list.push(item);
        }
      });
    }
    return list;
  }

  // BFF 결과 실패유무
  private isFail(resp) {
    return resp.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(resp.result);
  }

  // 사용요금 조회
  private _getUsageFee() {
    return this.apiService.request(API_CMD.BFF_05_0204, {}).map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          info: resp
        };
      }
      return FormatHelper.isEmpty(resp.result.invDt) ? {} : resp.result;
    });
  }

  // 미납요금조회
  private _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      return resp.code !== API_CODE.CODE_00 || resp.result.unPaidTotSum === '0' ? null : resp.result;
    });
  }

  // 납부/청구 정보 조회
  private _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0058, {}).map((resp) => {
      if (this.isFail(resp)) {
        return undefined;
      }
      const {result} = resp;
      // DV001-10696 기존의 우편요금서 유형코드 4, 5, 8, C를 수신했을 경우에 To-be의 기타(우펀) 유형코드 1과 동일하게 처리해 주기 바랍니다.
      if (['4', '5', '8', 'C'].indexOf(result.billTypeCd) > -1) {
        result.billTypeNm = MYT_FARE_BILL_TYPE[result.billTypeCd];
      }
      return resp.result;
    });
  }

  // 제휴카드 정보조회
  private _getAffiliateCard() {
    return this.apiService.request(API_CMD.BFF_07_0102, {}).map((resp) => {
      return resp.code !== API_CODE.CODE_00 ? null : resp.result;
    });
  }

  // 자동납부방법 조회
  private _getAutoPayment() {
    // skbroadband 는 조회 못함.
    if (this.info.svcInfo.actCoClCd === 'B') {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((resp) => {
      return resp.code !== API_CODE.CODE_00 ? null : resp.result;
    });
  }

  // 일시정지/해제
  _getPausedState() {
    // 유선인 경우
    if (this.info.svcInfo.svcAttrCd.indexOf('S') > -1) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0149, {}).map((resp) => {
      return this.isFail(resp) ? null : resp.result;
    });
  }

  // 장기 일시정지
  _getLongPausedState() {
    // 유선인 경우
    if (this.info.svcInfo.svcAttrCd.indexOf('S') > -1) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_05_0194, {}).map((resp) => {
      return this.isFail(resp) ? null : resp.result;
    });
  }

  // 가입정보
  private _getMyInfo() {
    // skbroadband 는 조회 못함.
    if (this.info.svcInfo.actCoClCd === 'B') {
      return Observable.of(null);
    }
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0068, {}).map((resp) => {
      return this.isFail(resp) ? null : resp.result;
    });
  }

  private _parseInt(str: String) {
    if ( !str ) {
      return 0;
    }

    return parseInt(str.replace(/,/g, ''), 10);
  }

  /**
   * @desc 에러 렌더
   * @param res
   * @param options
   * @private
   */
  private errorRender(res: Response, options: any): any {
    const {pageInfo, svcInfo} = this.info;
    this.error.render(res, {
      ...options,
      title: MYT_FARE_SUBMAIN_TITLE.MAIN,
      pageInfo,
      svcInfo
    });
  }
}
