/**
 * FileName: myt-fare.info.history.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_FARE_PAYMENT_HISTORY_TYPE, MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TYPE } from '../../../../types/string.type';
import {MYT_FARE_PAYMENT_CODE, MYT_FARE_POINT_PAYMENT_STATUS, MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING } from '../../../../types/bff.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
  sortType: string;
}

interface PaymentData {
  type?: string;
  isAutoWithdrawalUse?: boolean;
  withdrawalBankName?: string;
  withdrawalBankAccount?: string;
  withdrawalBankSerNum?: string;
  withdrawalBankCode?: string;
  overPaymentCount?: number;
  refundPaymentCount?: number;
  refundTotalAmount?: string;
  refundPaymentCnt?: number;
  isPersonalBiz?: boolean;
  // personalBizNum?: string;
  listData?: PaymentList;
  getLastPaymentData?: boolean; // BFF_07_0030 전체납부내역 paymentRecord 를 데이터에 포함시킬지 여부
}

interface PaymentList {
  [key: string]: any;
}
interface TipInfo {
  link: string;
  view: string;
  title: string;
}
interface ErrorInfo {
  code: string;
  msg: string;
}
class MyTFareInfoHistory extends TwViewController {
  private paymentData: PaymentData = {};
  private returnErrorInfo: ErrorInfo | any;

  constructor() {
    super();
    this.returnErrorInfo = {}; 
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0],
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

  private renderView(req: Request, res: Response, next: NextFunction, data: any) {
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

  // 사업자 여부
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

  // 자동납부통합인출 해지 버튼 노출을 위한 조회 (대상자 아니라면 비노출)
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

  // 과납내역 조회, 최근납부내역 조회 
  private getOverAndRefundPaymentData = (opt: {getPayList?: boolean} = {}): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        // 전체납부내역조회 옵션으로 조회에서 에러 반환 시 에러 페이지 처리
        // 과납내역 조회도 있으므로 해당 API에서 에러코드가 반환된다고 에러 페이지를 노출하면 안됨
        if (opt.getPayList) {
          this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
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

      // 과납내역
      /* resp.result.overPaymentRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataAmt = FormatHelper.addComma(o.svcBamt);
      }); */

      // 최근납부내역 2019.02.21
      if (opt.getPayList) {
        this.paymentData.getLastPaymentData = true;
        resp.result.paymentRecord.map(o => {
          o.sortDt = o.opDt;
          o.dataDt = DateHelper.getShortDate(o.opDt);
          o.listTitle = o.payMthdCdNm; 
          o.dataAmt = FormatHelper.addComma(o.payAmt);
          // 포인트 케이스 15 or BB 로 시작될 경우로 확인
          o.isPoint = (o.payMthdCd === '15' || o.payMthdCd.indexOf('BB') >= 0);
          o.noLink = true;
        });
      }


      return resp.result;
    });
  }

  // 즉시납부내역 조회
  private getDirectPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0090, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.directPaymentList = resp.result;
      resp.result.directPaymentList.map((o) => {
        o.sortDt = o.opDt;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.DIRECT;
        o.dataIsBankOrCard = this.isBankOrCard(o.cardCdNm) || this.isBankOrCard(o.settleWayCd) ;
        o.listTitle = o.dataIsBankOrCard ? o.cardCdNm + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.cardCdNm;
        o.isPoint = (o.settleWayCd === MYT_FARE_PAYMENT_CODE.POINT);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTime(o.opDt + o.payOpTm);
        o.dataAmt = FormatHelper.addComma(o.cardAmt);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.direct + (o.cardProcCd === 'N' ? '' + MYT_FARE_PAYMENT_HISTORY_TYPE.CANCEL_KOR_TITLE : '');
      });
      return resp.result;
    });
  }

  // 자동납부내역 조회
  private getAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0092, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.autoPaymentList = resp.result;

      resp.result.autoPaymentList.map((o, index) => {
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.AUTO;
        o.innerIndex = index;
        o.sortDt = o.drwDt;
        o.dataAmt = FormatHelper.addComma(o.drwAmt);
        o.listTitle = o.bankCardCoCdNm + (!this.isCard(o.bankCardCoCdNm) ? ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : '');
        o.dataDt = DateHelper.getShortDate(o.drwDt);
        o.dataSubInfo2 = o.drwErrCdNm;
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.auto;
      });
      return resp.result;
    });
  }

  // 자동납부 통합인출 내역 조회
  private getAutoUnitedPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0089, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.autoUnitedPaymentList = resp.result;

      resp.result.autoUnitedPaymentList.map((o, index) => {
        o.sortDt = o.drwDt;
        o.innerIndex = index;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.AUTOALL;
        o.listTitle = o.bankNm + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE; // 통합인출은 은행이 전제임 
        o.dataAmt = FormatHelper.addComma(o.drwAmt);
        o.dataDt = DateHelper.getShortDate(o.drwDt);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.autoAll;
      });
      return resp.result;
    });
  }

  // 소액결제 내역 조회
  private getMicroPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0071, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.microPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index; 
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.MICRO;
        o.listTitle = o.settlWayNm;
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTime(o.opDt + o.payOpTm);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.microPrepay;
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : '');
      });

      return resp.result;
    });
  }

  // 콘텐츠 결제 내역 조회
  private getContentsPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0078, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.useContentsPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index; 
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.CONTENT;
        o.listTitle = o.settlWayNm;
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTime(o.opDt + o.payOpTm);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.contentPrepay;
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : '');
      });

      return resp.result;
    });
  }

  // 포인트 납부예약(1회 납부예약)
  private getPointReservePaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0093, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }

      resp.result.reservePointList = resp.result;

      resp.result.reservePointList.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.PRESERVE; // 포인트예약
        o.listTitle = o.pointNm;
        o.isPoint = true;
        o.dataAmt = FormatHelper.addComma(o.point);
        o.reserveCancelable = o.cancelYn === 'Y'; // 취소가능여부
        o.dataSubInfo = o.reqNm;
        o.dataSubInfo2 = o.reqSt;
        o.dataDt = DateHelper.getShortDate(o.opDt);
      });

      return resp.result;
    });
  }

  // 포인트 자동납부
  private getPointAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0094, {}).map((resp: { code: string; msg: string | null; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.setErrorInfo({code: resp.code, msg: resp.msg || '', result: resp.result});
        return null;
      }
      resp.result.usePointList = resp.result;
      
      resp.result.usePointList.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.PAUTO; // 포인트자동납부
        o.noLink = this.isNoLink(o.reqSt); // === MYT_FARE_POINT_PAYMENT_STATUS.CLOSE); // 납부해지단계에서는 링크를 걸지 않음
        o.listTitle = o.pointNm; 
        o.isPoint = true;
        o.dataAmt = FormatHelper.addComma(o.point);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataSubInfo = o.reqNm;
        o.dataSubInfo2 = o.reqSt;
      });

      return resp.result;
    });
  }

  // 조회된 데이터 통합
  private mergeData(data: PaymentList): any {
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
          // if (myTPaymentHistory) {
          //   prev.mergedListData = prev.mergedListData.concat(myTPaymentHistory);
          // }
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
        /*if (cur.refundPaymentRecord && !prev.refundRecordList) {
          prev.refundRecordList = cur.refundPaymentRecord;
        }*/
        /*if (cur.overPaymentRecord && !prev.overPaymentList) {
          prev.overPaymentList = cur.overPaymentRecord;
        }*/
      }

      return prev;
    }, {});

    // 날짜별 정렬
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

  private isNoLink(o: string): boolean {
    return (MYT_FARE_POINT_PAYMENT_STATUS.OPEN === o || MYT_FARE_POINT_PAYMENT_STATUS.OPEN2 === o || MYT_FARE_POINT_PAYMENT_STATUS.CHANGE === o ||
       MYT_FARE_POINT_PAYMENT_STATUS.CHANGE2 === o || MYT_FARE_POINT_PAYMENT_STATUS.CLOSE === o || MYT_FARE_POINT_PAYMENT_STATUS.CLOSE2 === o);
  }
  private isBank(o: string): boolean {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK2) > 0)
        || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK3) > 0 || (o === MYT_FARE_PAYMENT_CODE.BANK) || (o === MYT_FARE_PAYMENT_CODE.BANK2));
  }

  private isCard(o: string): boolean {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD2) > 0
        || (o === MYT_FARE_PAYMENT_CODE.CARD));
  }

  private isBankOrCard(o: string): boolean {
    return this.isBank(o) || this.isCard(o);
  }
  
  private checkPayType(o: string): string {
    return MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING[o] || o;
  }
 

  private getKorStringWithQuery(current: string): any {
    return MYT_FARE_PAYMENT_HISTORY_TYPE[this.getCamelString(current)];
  }

  private getCamelString(queryString: string): string {
    // string-string => stringString 
    return (queryString.match(/-\w/gi) || []).reduce((prev, cur) => prev.replace(cur, cur.toUpperCase().replace('-', '')), queryString);
  }

  private setErrorInfo(resp: {code: string, msg: string, result: any}): void {
    if (!this.returnErrorInfo.code) {
      this.returnErrorInfo = {
        code: resp.code,
        msg: resp.msg
      };
    }
  }

  // 꼭 확인해 주세요 팁 메뉴 정리
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
