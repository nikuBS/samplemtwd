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
import {SVC_ATTR_NAME} from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';
// OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
import CommonHelper from '../../utils/common.helper';
import {MytFareInfoMiriService} from './services/info/myt-fare.info.miri.service';
import {MytFareSubmainGuideService} from './services/submain/myt-fare.submain.guide.service';
import {MytFareSubmainSmallService} from './services/submain/myt-fare.submain.small.service';
import moment from 'moment';
import {MytFareSubmainChildService} from './services/submain/myt-fare.submain.child.service';
import {MytFareSubmainMyBenefitService} from './services/submain/myt-fare.submain.my-benefit.service';

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
    this.apiService.setTimeout(5000); // 타임아웃 3초 설정
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

    try {
      this.getRquests(data, res).subscribe( resp => {
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
    }

    return Observable.combineLatest(
      reqs
    ).map( (responses) => {
      const [submain, guide, ...other] = responses;
      if (submain.code && submain.code !== API_CODE.CODE_00) {
        return this.errorRender(res, submain);
      }
      const [small, benefit] = other || {};
      Object.assign(data, {
        guide,
        small,
        benefit
      });

      return data;
    });
  }

  private getSubmain(data: any): Observable<any> {
    const date = this.info.req.query.date;
    data.claimDt = date;
    data.month = this._mytFareSubmainGuideService.getMonth(date, 'M');
    data.claimFirstDay = DateHelper.getShortFirstDate(date);
    data.claimLastDay = DateHelper.getShortLastDate(date);
    data.claimPay = '0';
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
    // 1일~4일 에는 요금조회가 안됨
    if (new Date().getDate() < 5) {
      data.isNotClaimData = true;
      return Observable.of(data);
    }

    return this._requestClaim(data);
  }

  private getBillCharge(svcInfo, res): Observable<any> {
    return this._mytFareSubmainGuideService.getBillCharge(svcInfo, res).switchMap( resp => {
      if (resp.code && resp.code !== API_CODE.CODE_00) {
        return Observable.of(null);
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
        // reqs.push(this._getTotalPayment());
        reqs.push(this._getAutoPayment());
      } else {
        data.type = 'UF';
        reqs.push(this._getUsageFee());
      }
      reqs = commonReqs.concat(reqs);
      return Observable.combineLatest(
        reqs
      ).map((responses) => {
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
          const [nonpayment, /*totalPayment, */autoPayment] = responses;
          if ( nonpayment ) {
            const unPaidTotSum = nonpayment.unPaidTotSum || '0';
            data.nonpayment = nonpayment;
            data.unPaidTotSum = unPaidTotSum !== '0' ? FormatHelper.addComma(unPaidTotSum) : null;
          }

          // 최근납부내역. 안쓸거 같음
          /*if ( totalPayment ) {
            data.totalPayment = totalPayment.paymentRecord.slice(0, 3).map(o => {
              return Object.assign(o, {
                isPoint : (o.payMthdCd === '15' || o.payMthdCd.indexOf('BB') >= 0)
              });
            });
          }*/
          // 자동납부 정보
          if (autoPayment) {
            data.autoPayment = autoPayment;
          }

          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1 ) {
            svcInfo.nickNm = SVC_ATTR_NAME[svcInfo.svcAttrCd];
          }
          /*const claim = data.claim;
          // 청구요금
          if ( !FormatHelper.isEmpty(claim.invDt) ) {
            data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(claim.dcAmt))).toString() );
          } else {
            data.isRealTime = false;
          }*/
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
          /*if ( usage ) {
            data.usage = usage;
          } else {
            data.isRealTime = false;
          }*/
          // PocketFi or T Login 인 경우 이용요금자세히버튼 노출
          if ( ['M3', 'M4'].indexOf(data.svcInfo.svcAttrCd) > -1 ) {
            data.isNotAutoPayment = false;
          }
        }

        this.getClaimDate(data);

        return data;
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
    // const sDate = DateHelper.getPast6MonthsShortDate();
    const eDate = DateHelper.getEndOfMonSubtractDate(new Date(), '1', 'YYYYMMDD');
    const sDate = DateHelper.getEndOfMonSubtractDate(eDate, '5', 'YYYYMMDD');
    let haveClaim = false; // 선택월 청구데이터 있는지 여부
    amtList.map( item => {
      // 선택월의 청구금액
      if (item.invDt === date) {
        data.claimPay = item.invAmt || '0';
        haveClaim = true;
        data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(claim.dcAmt))).toString() );
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
    data.latestDates = latestDates;
    data.isRealTime = !haveClaim ? false : data.isRealTime;

    // 최근 6개월 청구내역이 없는경우, 당월 가입자인지 확인한다.
    this.checkNewMember(data).subscribe( resp => {
      data = resp;
      if (!isRep || data.isNewMember) {
        return;
      }
      /*
          대표청구 인 경우
          해당월 청구요금, 부분납부한 요금, 잔여납부 금액, 미납
       */
      // 청구금액
      // 당월 납부해야할 금액
      let remainPayment = data.claimPay;
      // 미납금액: 조회월의 이전 미납금액들의 sum
      let unpaid = 0;
      ((data.nonpayment || {}).unPaidAmtMonthInfoList || []).map( unpay => {
        const unPaidAmt = this.getInt(unpay.unPaidAmt);
        // 선택월 납부해야할 금액
        if (unpay.unPaidInvDt === date) {
          remainPayment = unPaidAmt;
        }
        // 선택월보다 이전 미납액들의 총 합계
        if (DateHelper.isBefore(unpay.unPaidInvDt, date)) {
          unpaid += unPaidAmt;
        }
      });
      // 부분 납부한 금액: 청구금액 - 납부해야하는 금액
      const prepay = this.getInt(data.claimPay) - this.getInt(remainPayment);
      Object.assign(data, {
        totalClaim: this.addComma(remainPayment + unpaid),
        prepay: this.addComma(prepay),
        remainPayment: this.addComma(remainPayment),
        unpaid: this.addComma(unpaid)
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
        isPaid: remainPayment.toString() === '0', // 납부 여부(예정, 완료)
        payCode,
        payDate
        // payDate: dateOfPayType[payCode] ? DateHelper.getShortDate(dateOfPayType[payCode]) : ''
      };
    });

  }

  // 이번달 가입자인지 확인
  private checkNewMember(data: any): any {
    data.isNewMember = false;
    if (data.latestDates.length !== 0) {
      return Observable.of(data);
    }
    this._getMyInfo().map( resp => {
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

  // 사용요금 조회
  private _getUsageFee() {
    return this.apiService.request(API_CMD.BFF_05_0204, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          info: resp
        };
      }
      return FormatHelper.isEmpty(resp.result.invDt) ? null : resp.result;
    });
  }

  // 미납요금조회(성능개선항목으로 미조회)
  private _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      return resp.code !== API_CODE.CODE_00 || resp.result.unPaidTotSum === '0' ? null : resp.result;
    });
  }

  // 납부/청구 정보 조회
  private _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0058, {}).map((resp) => {
      return resp.code === API_CODE.CODE_00 ? resp.result : null;
    });
  }

  // 제휴카드 정보조회
  private _getAffiliateCard() {
    return this.apiService.request(API_CMD.BFF_07_0102, {}).map((resp) => {
      return resp.code === API_CODE.CODE_00 ? resp.result : null;
    });
  }

  // 자동납부방법 조회
  private _getAutoPayment() {
    // skbroadband 는 조회 못함.
    if (this.info.svcInfo.actCoClCd === 'B') {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((resp) => {
      return resp.code === API_CODE.CODE_00 ? resp.result : null;
    });
  }

  // 가입정보
  private _getMyInfo() {
    // skbroadband 는 조회 못함.
    if (this.info.svcInfo.actCoClCd === 'B') {
      return Observable.of(null);
    }
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0068, {}).map((resp) => {
      return resp.code === API_CODE.CODE_00 ? resp.result : null;
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
