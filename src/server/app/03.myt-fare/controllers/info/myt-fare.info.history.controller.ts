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
import { MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE } from '../../../../types/bff.type';

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
}

interface PaymentList {
  [key: string]: any;
}
interface Info {
  [key: string]: string;
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

    if (query.sortType === 'payment' || query.sortType === undefined) {
      this.getAllPaymentData(req, res, next, query, svcInfo, pageInfo);
    } else {
      switch (query.sortType) {
        // 즉시납부
        case 'direct':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
              this.getOverAndRefundPaymentData(query.current),
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
    res.render('info/myt-fare.info.history.html', {
      svcInfo: data.svcInfo,
      pageInfo: data.pageInfo,
      currentString: data.query.sortType ? this.getKorStringWithQuery(data.query.sortType) : MYT_FARE_PAYMENT_HISTORY_TYPE.all,
      data: {
        isAutoWithdrawalUse: this.paymentData.isAutoWithdrawalUse,
        autoWithdrawalBankName: this.paymentData.withdrawalBankName,
        autoWithdrawalBankNumber: this.paymentData.withdrawalBankAccount,
        autoWithdrawalBankCode: this.paymentData.withdrawalBankCode,
        autoWithdrawalBankSerNum: this.paymentData.withdrawalBankSerNum,
        refundPaymentCount: this.paymentData.refundPaymentCount,
        overPaymentCount: this.paymentData.overPaymentCount,
        refundTotalAmount: this.paymentData.refundTotalAmount,
        refundPaymentCnt: this.paymentData.refundPaymentCnt,
        isPersonalBiz: this.paymentData.isPersonalBiz,
        // personalBizNum: this.paymentData.personalBizNum,
        listData: this.mergeData(data.listData),
        refundURL: `${req.originalUrl.split('/').slice(0, -1).join('/')}/overpay-refund`,
        current: (data.query.sortType === 'payment' || data.query.sortType === undefined) ? 'all' : data.query.sortType,
        noticeInfo: this.getNoticeInfo()
      }
    });
  }

  private checkHasPersonalBizNumber = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'H'}).map((resp: { code: string; result: any; }) => {
      if (resp.code !== API_CODE.CODE_00) {
        this.paymentData.isPersonalBiz = false;
      } else {
        this.paymentData.isPersonalBiz = true;
        /*this.paymentData.personalBizNum = resp.result.taxReprintList ?
            resp.result.taxReprintList[0] ? resp.result.taxReprintList[0].ctzBizNum : '' : '';*/
      }

      return null;
    });
  }

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

  private getAllPaymentData(req: Request, res: Response, next: NextFunction, query: Query, svcInfo: any, pageInfo: any) {
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
  }

  private getOverAndRefundPaymentData = (current?: string): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      this.paymentData.overPaymentCount = parseInt(resp.result.ovrPayCnt, 10); // 과납건수
      this.paymentData.refundPaymentCount = parseInt(resp.result.rfndTotAmt, 10); // 환불받을 총 금액
      this.paymentData.refundTotalAmount = FormatHelper.addComma(resp.result.rfndTotAmt.toString());
      this.paymentData.refundPaymentCnt = resp.result.refundPaymentRecord.length;

      /*// 환불신청내역
      resp.result.refundPaymentRecord.map((o) => {
        o.sortDt = o.rfndReqDt;
        o.dataDt = DateHelper.getShortDate(o.rfndReqDt);
        o.dataOverpay = FormatHelper.addComma(o.ovrPay);
        o.dataRefundObjAmt = FormatHelper.addComma(o.rfndObjAmt);
        o.dataSumAmt = FormatHelper.addComma(o.sumAmt);
        o.dataRefundState = MYT_PAYMENT_HISTORY_REFUND_TYPE[o.rfndStat];
        o.rfndStat = o.rfndStat;
      });*/

      // 과납내역
      resp.result.overPaymentRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataAmt = FormatHelper.addComma(o.svcBamt);
      });

      return resp.result;
    });
  }

  private getDirectPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0090, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.directPaymentList = resp.result;
      resp.result.directPaymentList.map((o) => {
        o.sortDt = o.opDt;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.DIRECT;
        o.dataIsBankOrCard = this.isBankOrCard(o.cardCdNm) || this.isBankOrCard(o.settleWayCd) ;
        o.listTitle = o.dataIsBankOrCard ? o.cardCdNm + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.cardCdNm;
        o.isPoint = (o.settlWayNm === MYT_FARE_PAYMENT_CODE.POINT);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTimeWithDot(o.opDt + o.payOpTm);
        o.dataAmt = FormatHelper.addComma(o.cardAmt);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.direct + (o.cardProcCd === 'N' ? '' + MYT_FARE_PAYMENT_HISTORY_TYPE.CANCEL_KOR_TITLE : '');
      });
      return resp.result;
    });
  }

  private getAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0092, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
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

  private getAutoUnitedPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0089, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.autoUnitedPaymentList = resp.result;

      resp.result.autoUnitedPaymentList.map((o, index) => {
        o.sortDt = o.drwDt;
        o.innerIndex = index;
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.AUTOALL;
        o.listTitle = o.dataIsBank ? o.dataTitle + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.dataTitle;
        o.dataAmt = FormatHelper.addComma(o.drwAmt);
        o.dataDt = DateHelper.getShortDate(o.drwDt);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.autoAll;
      });
      return resp.result;
    });
  }

  private getMicroPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0071, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.microPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index; 
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.MICRO;
        o.listTitle = o.settlWayNm;
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTimeWithDot(o.opDt + o.payOpTm);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.microPrepay;
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : '');
      });

      return resp.result;
    });
  }

  private getContentsPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0078, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.useContentsPrepayRecord.map((o, index) => {
        o.sortDt = o.opDt;
        o.innerIndex = index; 
        o.dataPayMethodCode = MYT_FARE_PAYMENT_TYPE.CONTENT;
        o.listTitle = o.settlWayNm;
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataFullDt = DateHelper.getFullDateAndTimeWithDot(o.opDt + o.payOpTm);
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.contentPrepay;
        o.dataSubInfo3 = (o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : '');
      });

      return resp.result;
    });
  }

  // 포인트 납부예약(1회 납부예약)
  private getPointReservePaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0093, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
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
    return this.apiService.request(API_CMD.BFF_07_0094, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
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

        /*if (cur.refundPaymentRecord && !prev.refundRecordList) {
          prev.refundRecordList = cur.refundPaymentRecord;
        }*/
        if (cur.overPaymentRecord && !prev.overPaymentList) {
          prev.overPaymentList = cur.overPaymentRecord;
        }
      }

      return prev;
    }, {});

    FormatHelper.sortObjArrDesc(data.mergedListData, 'sortDt');

    data.mergedListData = data.mergedListData.reduce((prev, cur, index) => {
      cur.listId = index;
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
  private isBank(o: string) {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK2) > 0)
        || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK3) > 0 || (o === MYT_FARE_PAYMENT_CODE.BANK) || (o === MYT_FARE_PAYMENT_CODE.BANK2));
  }

  private isCard(o: string) {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD2) > 0
        || (o === MYT_FARE_PAYMENT_CODE.CARD));
  }

  private isBankOrCard(o: string) {
    return this.isBank(o) || this.isCard(o);
  }
  
  private checkPayType(o: string): string {
    return MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING[o] || o;
  }
 

  private getKorStringWithQuery(current: string): any {
    return MYT_FARE_PAYMENT_HISTORY_TYPE[this.getKeyWithQuery(current)];
  }

  private getKeyWithQuery(queryString: string): any {
    return queryString.split('').filter((elem, idx, arr) => {
      if (elem === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
        return '';
      }
      return elem;
    }).join('');
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
  private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_08_tip_01', view: 'MF_08', title: '다회선 통합납부 고객'},
      {link: 'MF_08_tip_02', view: 'MF_08', title: '납부내역 조회기간 안내'},
      {link: 'MF_08_tip_03', view: 'MF_08', title: '자동납부, 지로납부 확인'},
      {link: 'MF_08_tip_04', view: 'MF_08', title: '요금납부 안내'},
      {link: 'MF_08_tip_05', view: 'MF_08', title: '납부취소 안내'}
    ];
  }
}

export default MyTFareInfoHistory;
