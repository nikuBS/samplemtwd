/**
 * @file [나의요금-요금납부조회-리스트] 관련 처리
 * @author Lee Kirim
 * @since 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_FARE_PAYMENT_HISTORY_TYPE, MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TYPE } from '../../../../types/string.type';
import {MYT_FARE_PAYMENT_CODE, MYT_FARE_POINT_PAYMENT_STATUS, MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING } from '../../../../types/bff.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * query로 받을 형태 정의 sortType 카테고리타입 
 */
interface Query {
  sortType: string;
}

/**
 * js 로 전달할 데이터 타입 형태 정의
 * 전달 시 해당 정보 외에 추가로 더 전송함 renderView 메서드 참고
 */
interface PaymentData {
  type?: string;
  isAutoWithdrawalUse?: boolean; // 자동납부 통합인출 사용여부 / 사용시 리스트에서 통합인출 버튼 해지 버튼 보여야 함
  withdrawalBankName?: string; // 자동납부 통합인출 은행이름
  withdrawalBankAccount?: string; // 자동납부 통합인출 계좌
  withdrawalBankSerNum?: string; // 자동납부 통합인출 계좌 일련번호
  withdrawalBankCode?: string; // 자동납부 통합인출 은행 코드
  overPaymentCount?: number; // 과납건수
  refundPaymentCount?: number; // 환불신청 갯수
  refundTotalAmount?: string; // 환불받을 총 금액
  refundPaymentCnt?: number; // 환불신청내역건수
  isPersonalBiz?: boolean; // 사업자인지 여부
  listData?: PaymentList; // 리스트
  getLastPaymentData?: boolean; // BFF_07_0030 전체납부내역 paymentRecord 를 데이터에 포함시킬지 여부 listData 합산시 기준
}

/**
 * 리스트 정보 인터페이스
 */
interface PaymentList {
  [key: string]: any;
}

/**
 * 팁정보 형태 정의
 */
interface TipInfo {
  link: string;
  view: string;
  title: string;
}

/**
 * 에러 반환값 정의
 */
interface ErrorInfo {
  code: string;
  msg: string;
}

/**
 * 요금납부내역 조회 구현
 */
class MyTFareInfoHistory extends TwViewController {
  private paymentData: PaymentData = {};
  private returnErrorInfo: ErrorInfo | any;

  constructor() {
    super();
    this.returnErrorInfo = {}; 
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      sortType: req.query.sortType
    };    

    // 각 납부 타입을 sortType param으로 받음 
    if (query.sortType === 'payment' || query.sortType === undefined) {
      // 2019.02.21 전체납부내역 -> 최근납부내역 BFF_07_0030 의 데이터로 수정 노출 결정 
      // this.getAllPaymentData(req, res, next, query, svcInfo, pageInfo); // deprecated
      // 전체납부내역 case 
      Observable.combineLatest(
          this.checkHasPersonalBizNumber(),
          this.getAutoWithdrawalAccountInfo(),
          this.getOverAndRefundPaymentData({getPayList: true}),
      ).subscribe(histories => {
        this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
      });
    } else {
      switch (query.sortType) {
        // 즉시납부
        case 'direct':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getDirectPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 자동납부
        case 'auto':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getAutoPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 자동납부 통합인출
        case 'auto-all':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getAutoUnitedPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 소액결제 선결제
        case 'micro-prepay':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getMicroPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 콘텐츠 이용요금 선결제
        case 'content-prepay':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getContentsPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 포인트 납부예약
        case 'point-reserve':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getPointReservePaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        // 포인트 자동납부
        case 'point-auto':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(),
              this.getPointAutoPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo});
          });
          break;
        default:
          break;
      }
    }

  }

  /**
   * @param req 
   * @param res 
   * @param next 
   * @param data {query: query, listData: histories, svcInfo: svcInfo, pageInfo: pageInfo}
   * @return {void}
   */
  private renderView(req: Request, res: Response, next: NextFunction, data: any): void {
    const {pageInfo, svcInfo} = data;

    // Error 를 반환했던 API code 가 있었던 경우 
    if (this.returnErrorInfo.code) {
      return this.error.render(res, {
        code: this.returnErrorInfo.code,
        msg: this.returnErrorInfo.msg,
        pageInfo,
        svcInfo
      });
    }

    // 정상 render
    return res.render('info/myt-fare.info.history.html', {
      svcInfo,
      pageInfo,
      currentString: data.query.sortType ? this.getKorStringWithQuery(data.query.sortType) : MYT_FARE_PAYMENT_HISTORY_TYPE.lastAll, // 카테고리 텍스트
      data: {
        isMobile: svcInfo.svcAttrCd.indexOf('M') >= 0, // 무선계정여부 선택 카테고리 노출여부에 적용
        isAutoWithdrawalUse: this.paymentData.isAutoWithdrawalUse, // 자동납부 통합인출 사용 여부
        autoWithdrawalBankName: this.paymentData.withdrawalBankName, // 자동납부 통합인출 은행이름 || undefined
        autoWithdrawalBankNumber: this.paymentData.withdrawalBankAccount, // 자동납부 통합인출 계좌 || undefined
        autoWithdrawalBankCode: this.paymentData.withdrawalBankCode, // 자동납부 통합인출 은행코드 || undefined
        autoWithdrawalBankSerNum: this.paymentData.withdrawalBankSerNum, // 자동납부 통합인출 계좌일련번호  || undefined
        refundPaymentCount: this.paymentData.refundPaymentCount,
        overPaymentCount: this.paymentData.overPaymentCount,
        refundTotalAmount: this.paymentData.refundTotalAmount,
        refundPaymentCnt: this.paymentData.refundPaymentCnt,
        isPersonalBiz: this.paymentData.isPersonalBiz, // 사업자 인지
        // personalBizNum: this.paymentData.personalBizNum,
        listData: this.mergeData(data.listData), // 리스트 
        refundURL: `${req.originalUrl.split('/').slice(0, -1).join('/')}/overpay-refund`,
        refundAccountURL: `${req.originalUrl.split('/').slice(0, -1).join('/')}/overpay-account`,
        current: (data.query.sortType === 'payment' || data.query.sortType === undefined) ? 'all' : data.query.sortType,
        noticeInfo: this.getTipInfo() // 꼭 확인해 주세요 팁 버튼 정보
      }
    });
  }

  /**
   * @return {Observable}
   * @desc 사업자 여부
   */
  private checkHasPersonalBizNumber = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'H'}).map((resp: { code: string; result: any; }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.paymentData.isPersonalBiz = false;
      } else {
        this.paymentData.isPersonalBiz = true;
      }

      return null;
    });
  }

  /**
   * @return {Observable}
   * @desc 자동납부통합인출 해지 버튼 노출을 위한 조회 (대상자 아니라면 비노출)
   */
  private getAutoWithdrawalAccountInfo = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0070, {}).map((resp: { code: string; result: any }) => {
      if (resp.code === 'BIL0021' || resp.code === 'BIL0022' || !resp.result) {
        this.paymentData.isAutoWithdrawalUse = false;
        return null;
      }

      this.paymentData.isAutoWithdrawalUse = true;
      this.paymentData.withdrawalBankName = resp.result.bankNm;
      this.paymentData.withdrawalBankSerNum = resp.result.bankSerNum;
      this.paymentData.withdrawalBankCode = resp.result.bankCd;
      this.paymentData.withdrawalBankAccount = resp.result.bankNum;

      return null;
    });
  }

  // 2019.02.21 deprecated 전체납부내역 조회 케이스 -> 최근납부내역으로 수정 서브메인 최근납부내역과 싱크가 맞지 않는 이슈
  /* private getAllPaymentData(req: Request, res: Response, next: NextFunction, query: Query, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
        this.checkHasPersonalBizNumber(),
        this.getAutoWithdrawalAccountInfo(),
        this.getOverAndRefundPaymentData(),
        this.getDirectPaymentData(),
        this.getAutoPaymentData(),
        this.getAutoUnitedPaymentData(),
        this.getMicroPaymentData(),
        this.getContentsPaymentData(),
        this.getPointReservePaymentData(),
        this.getPointAutoPaymentData()
    ).subscribe(histories => {
      this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo, pageInfo });
    });
  } */

  /**
   * @desc 과납내역 조회, 최근납부내역 조회 
   * @param {Object} opt : {getPayList: boolean} 최근납부내역 paymentData 에 저장할지 여부
   */
  private getOverAndRefundPaymentData = (opt: {getPayList?: boolean} = {}): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        // 전체납부내역조회 옵션으로 조회에서 에러 반환 시 에러 페이지 처리
        // 과납내역 조회도 있으므로 해당 API에서 에러코드가 반환된다고 에러 페이지를 노출하면 안됨
        if (opt.getPayList) {
          this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        }
        return null;
      }

      // 하단 코드 오류방지
      if (typeof resp.result !== 'object') {
        resp.result = {};
      }

      // 
      this.paymentData.overPaymentCount = parseInt(resp.result.ovrPayCnt || 0, 10); // 과납건수
      this.paymentData.refundPaymentCount = parseInt(resp.result.rfndTotAmt || 0, 10); // 환불받을 총 금액 number
      this.paymentData.refundTotalAmount = FormatHelper.addComma((resp.result.rfndTotAmt || '').toString()); // 환불받을 총 금액 쉼표 붙여서 string
      this.paymentData.refundPaymentCnt = (resp.result.refundPaymentRecord || []).length; // 환불신청내역 건수

      // 최근납부내역 2019.02.21
      if (opt.getPayList) {
        this.paymentData.getLastPaymentData = true;
        resp.result.paymentRecord.map(o => {
          o.sortDt = o.opDt; // 날짜 리스트 합칠 때 정렬기준이 됨
          o.dataDt = DateHelper.getShortDate(o.opDt); // 노출시 날짜 
          o.listTitle = o.payMthdCdNm; // 납부방법
          o.dataAmt = FormatHelper.addComma(o.payAmt); // 금액
          // 포인트 케이스 15 or BB 로 시작될 경우로 확인
          o.isPoint = (o.payMthdCd === '15' || o.payMthdCd.indexOf('BB') >= 0); // 원으로 입력 or P로 입력 될지 여부
          o.noLink = true; // 상세보기로 이동될지 여부 최근납부내역 케이스는 상세보기 제공하지 않음
        });
      }

      return resp.result;
    });
  }

  /**
   * @desc 즉시납부내역 조회
   * @return {Observable}
   */
  private getDirectPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0090, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.directPaymentList = resp.result;
      resp.result.directPaymentList.map((o) => {
        o.sortDt = o.opDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.DIRECT; // 납부방법
        o.dataIsBankOrCard = this.isBankOrCard(o.cardCdNm) || this.isBankOrCard(o.settleWayCd) ; /* @param {boolean} 은행납부인지 카드납부인지 여부 */
        o.listTitle = o.dataIsBankOrCard ? o.cardCdNm + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.cardCdNm;
        o.isPoint = (o.settleWayCd === MYT_FARE_PAYMENT_CODE.POINT); // 포인트인지 여부
        o.dataDt = DateHelper.getShortDate(o.opDt); // 표기될 날짜
        o.dataFullDt = DateHelper.getFullDateAnd24Time(o.opDt + o.payOpTm); // 날짜 시간 모두 표기
        o.dataAmt = FormatHelper.addComma(o.cardAmt); // 금액
        // 리스트에 표기될 부수정보
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.direct + (o.cardProcCd === 'N' ? '' + MYT_FARE_PAYMENT_HISTORY_TYPE.CANCEL_KOR_TITLE : ''); 
      });
      return resp.result;
    });
  }

  /**
   * @desc 자동납부내역 조회
   * @return {Observable}
   * 
   */
  private getAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0092, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.autoPaymentList = resp.result;

      resp.result.autoPaymentList.map((o, index) => {
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.AUTO; // 납부 방법
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.sortDt = o.drwDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.dataAmt = FormatHelper.addComma(o.drwAmt); // 금액
        o.listTitle = o.bankCardCoCdNm + (!this.isCard(o.bankCardCoCdNm) ? ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : ''); // 리스트 제목
        o.dataDt = DateHelper.getShortDate(o.drwDt); // 날짜
        o.dataSubInfo2 = o.drwErrCdNm; // 부수정보
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.auto; // 부수정보
      });
      return resp.result;
    });
  }

  /**
   * @desc 자동납부 통합인출 내역 조회
   * @return {Observable}
   * 
   */
  private getAutoUnitedPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0089, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.autoUnitedPaymentList = resp.result;

      resp.result.autoUnitedPaymentList.map((o, index) => {
        o.sortDt = o.drwDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.AUTOALL; // 납부코드
        o.listTitle = o.bankNm + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE; // 리스트 제목, 통합인출은 은행이 전제임 
        o.dataAmt = FormatHelper.addComma(o.drwAmt); // 금액
        o.dataDt = DateHelper.getShortDate(o.drwDt); // 표기될 날짜
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.autoAll; // 부수정보
      });
      return resp.result;
    });
  }

   /**
   * @desc 소액결제 내역 조회
   * @return {Observable}
   * 
   */
  private getMicroPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0071, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.microPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.MICRO; // 납부방법
        o.listTitle = o.settlWayNm; // 리스트 제목
        o.dataAmt = FormatHelper.addComma(o.chrgAmt); // 금액
        o.dataDt = DateHelper.getShortDate(o.opDt); // 표기될 날짜
        o.dataFullDt = DateHelper.getFullDateAnd24Time(o.opDt + o.payOpTm); // 날짜 + 시간
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.microPrepay; // 부수정보
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : ''); // 부수정보
      });

      return resp.result;
    });
  }

  /**
   * @desc 콘텐츠 결제 내역 조회
   * @return {Observable}
   * 
   */
  private getContentsPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0078, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.useContentsPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.CONTENT;
        o.listTitle = o.settlWayNm; // 리스트 제목
        o.dataAmt = FormatHelper.addComma(o.chrgAmt); // 금액
        o.dataDt = DateHelper.getShortDate(o.opDt); // 날짜
        o.dataFullDt = DateHelper.getFullDateAnd24Time(o.opDt + o.payOpTm); // 날짜 + 시간
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.contentPrepay; // 부수정보
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : ''); // 부수정보
      });

      return resp.result;
    });
  }

  /**
   * @desc 포인트 납부예약(1회 납부예약)
   * @return {Observable}
   * 
   */
  private getPointReservePaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0093, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }

      resp.result.reservePointList = resp.result;

      resp.result.reservePointList.map((o, index) => {
        o.sortDt = o.opDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.PRESERVE; // 포인트예약
        o.listTitle = o.pointNm; // 리스트 제목
        o.isPoint = true; // 포인트 여부
        o.dataAmt = FormatHelper.addComma(o.point); // 금액
        o.reserveCancelable = o.cancelYn === 'Y'; // 취소가능여부
        o.dataSubInfo = o.reqNm; // 부수정보
        o.dataSubInfo2 = o.reqSt; // 부수정보
        o.dataDt = DateHelper.getShortDate(o.opDt); // 표기될 날짜
      });

      return resp.result;
    });
  }

  /**
   * @desc 포인트 자동납부
   * @return {Observable}
   * 
   */
  private getPointAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0094, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || ''});
        return null;
      }
      resp.result.usePointList = resp.result;
      
      resp.result.usePointList.map((o, index) => {
        o.sortDt = o.opDt; // 날짜 , 리스트 합칠 때 정렬기준이 됨
        o.innerIndex = index; // 상세정보 조회시 사용할 값
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.PAUTO; // 포인트자동납부
        o.noLink = this.isNoLink(o.reqSt); // === MYT_FARE_POINT_PAYMENT_STATUS.CLOSE); // 납부해지단계에서는 링크를 걸지 않음
        o.listTitle = o.pointNm; // 리스트 제목
        o.isPoint = true; // 포인트 여부
        o.dataAmt = FormatHelper.addComma(o.point); // 금액
        o.dataDt = DateHelper.getShortDate(o.opDt); // 날짜
        o.dataSubInfo = o.reqNm; // 부수정보
        o.dataSubInfo2 = o.reqSt; // 부수정보
      });

      return resp.result;
    });
  }

  /**
   * @desc 조회된 데이터 통합
   * @param {PaymentList} data 
   * @return {PaymentList} interface 참조
   */
  private mergeData(data: PaymentList): PaymentList {
    data = data.slice(2);

    data = data.reduce((prev, cur) => {
      if (cur) {
        if (!prev.mergedListData) {
          prev.mergedListData = [];
        }

        if (cur.microPrepayRecord) {
          prev.mergedListData = prev.mergedListData.concat(cur.microPrepayRecord);
        } else if (cur.useContentsPrepayRecord) {
          prev.mergedListData = prev.mergedListData.concat(cur.useContentsPrepayRecord);
        } else if (cur.directPaymentList) {
          prev.mergedListData = prev.mergedListData.concat(cur.directPaymentList);
        } else if (cur.autoPaymentList) {
          prev.mergedListData = prev.mergedListData.concat(cur.autoPaymentList);
        } else if (cur.autoUnitedPaymentList) {
          prev.mergedListData = prev.mergedListData.concat(cur.autoUnitedPaymentList);
        } else if (cur.usePointList) {
          prev.mergedListData = prev.mergedListData.concat(cur.usePointList);
        } else if (cur.reservePointList) {
          prev.mergedListData = prev.mergedListData.concat(cur.reservePointList);
        }
        if (this.paymentData.getLastPaymentData && cur.paymentRecord) {
          prev.mergedListData = prev.mergedListData.concat(cur.paymentRecord);
        }
      }

      return prev;
    }, {});

    /* 날짜별 정렬 */
    FormatHelper.sortObjArrDesc(data.mergedListData, 'sortDt');

    data.mergedListData = data.mergedListData.reduce((prev: any[], cur: any, index: number): any[] => {
      cur.listId = index;
      cur.ariaIdx = index < 9 ? '0' + (index + 1) : index + 1; // 웹접근성 수정 중 aria-labelledby 속성위해 추가 19.2.13
      cur.listDt = cur.dataDt.slice(5);

      if (prev.length) {
        if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
          cur.yearHeader = cur.sortDt.slice(0, 4);
        }
      }

      prev.push(cur);

      return prev;
    }, []);

    return data;
  }

  /**
   * @desc 상세보기 있을지 여부 결정
   * @param {string} o 
   * @return {boolean}
   */
  private isNoLink(o: string): boolean {
    return (MYT_FARE_POINT_PAYMENT_STATUS.OPEN === o || MYT_FARE_POINT_PAYMENT_STATUS.OPEN2 === o || MYT_FARE_POINT_PAYMENT_STATUS.CHANGE === o ||
       MYT_FARE_POINT_PAYMENT_STATUS.CHANGE2 === o || MYT_FARE_POINT_PAYMENT_STATUS.CLOSE === o || MYT_FARE_POINT_PAYMENT_STATUS.CLOSE2 === o);
  }

  /**
   * @desc 은행인지 여부
   * @param {string} o 
   * @return {boolean}
   */
  private isBank(o: string): boolean {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK2) > 0)
        || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK3) > 0 || (o === MYT_FARE_PAYMENT_CODE.BANK) || (o === MYT_FARE_PAYMENT_CODE.BANK2));
  }

  /**
   * @desc 카드인지 여부
   * @param {string} o 
   * @return {boolean}
   */
  private isCard(o: string): boolean {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD2) > 0
        || (o === MYT_FARE_PAYMENT_CODE.CARD));
  }

  /**
   * @desc 은행이나 카드인지 여부
   * @param {string} o 
   * @return {boolean}
   */
  private isBankOrCard(o: string): boolean {
    return this.isBank(o) || this.isCard(o);
  }

  /**
   * @desc 배열로부터 한글 문구로 (directPay => 자동납부)
   * @param current 
   * @return {string} 
   */
  private getKorStringWithQuery(current: string): any {
    return MYT_FARE_PAYMENT_HISTORY_TYPE[this.getCamelString(current)];
  }

  /**
   * @desc 쿼리로 전달된 값을 카멜타입으로 변경 (ex: direct-pay => directPay)
   * @param {string} queryString 
   * @return {string}
   */
  private getCamelString(queryString: string): string {
    // string-string => stringString 
    return (queryString.match(/-\w/gi) || []).reduce((prev, cur) => prev.replace(cur, cur.toUpperCase().replace('-', '')), queryString);
  }

  /**
   * @desc obserable 조회시 에러 반환시 에러값 저장했다가 에러 노출
   * @param resp code, msg
   */
  private setErrorInfo(resp: {code: string, msg: string}): void {
    if (!this.returnErrorInfo.code) {
      this.returnErrorInfo = {
        code: resp.code,
        msg: resp.msg
      };
    }
  }

  /**
   * @desc 꼭 확인해주세요 TIP 정리
   * @prop {string} link 팁 클래스
   * @prop {string} view 팁 아이디
   * @prop {srting} title 문구
   */
  private getTipInfo(): TipInfo[] {
    return [
      {link: 'MF_08_tip_01', view: 'M000290', title: '다회선 통합납부 고객'},
      {link: 'MF_08_tip_02', view: 'M000290', title: '납부내역 조회기간 안내'},
      {link: 'MF_08_tip_03', view: 'M000290', title: '자동납부, 지로납부 확인'},
      {link: 'MF_08_tip_04', view: 'M000290', title: '요금납부 안내'},
      {link: 'MF_08_tip_05', view: 'M000290', title: '납부취소 안내'}
    ];
  }
}

export default MyTFareInfoHistory;
