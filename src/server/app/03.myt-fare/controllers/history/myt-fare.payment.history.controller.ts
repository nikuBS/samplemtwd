/**
 * FileName: myt-fare.payment.history.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_FARE_PAYMENT_HISTORY_TYPE, MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE, MYT_PAYMENT_HISTORY_REFUND_TYPE,
  MYT_PAYMENT_HISTORY_AUTO_UNITED_TYPE, MYT_PAYMENT_HISTORY_AUTO_TYPE} from '../../../../types/bff.type';

// import {myTPaymentHistory} from '../../../../mock/server/myt.payment.history';

// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
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
  isPersonalBiz?: boolean;
  personalBizNum?: string;
  listData?: PaymentList;
}

interface PaymentList {
  [key: string]: any;
}

class MyTFarePaymentHistory extends TwViewController {
  private paymentData: PaymentData = {};

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    if (query.current === 'payment' || query.current === '') {
      this.getAllPaymentData(req, res, next, query, svcInfo);
    } else {
      switch (query.current) {
        case 'direct':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
              this.getDirectPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
          });
          break;
        case 'auto':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
              this.getAutoPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
          });
          break;
        case 'auto-all':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
              this.getAutoUnitedPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
          });
          break;
        case 'micro-prepay':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
              this.getMicroPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
          });
          break;
        case 'content-prepay':
          Observable.combineLatest(
              this.checkHasPersonalBizNumber(),
              this.getAutoWithdrawalAccountInfo(),
              this.getOverAndRefundPaymentData(query.current),
              this.getContentsPaymentData()
          ).subscribe(histories => {
            this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
          });
          break;
        default:
          break;
      }
    }

  }

  private renderView(req: Request, res: Response, next: NextFunction, data: any) {

    res.render('history/myt-fare.payment.history.html', {
      svcInfo: data.svcInfo,
      currentString: this.getKorStringWithQuery(data.query.current) || MYT_FARE_PAYMENT_HISTORY_TYPE.all,
      data: {
        isAutoWithdrawalUse: this.paymentData.isAutoWithdrawalUse,
        autoWithdrawalBankName: this.paymentData.withdrawalBankName,
        autoWithdrawalBankNumber: this.paymentData.withdrawalBankAccount,
        refundPaymentCount: this.paymentData.refundPaymentCount,
        overPaymentCount: this.paymentData.overPaymentCount,
        refundTotalAmount: this.paymentData.refundTotalAmount,
        isPersonalBiz: this.paymentData.isPersonalBiz,
        personalBizNum: this.paymentData.personalBizNum,
        listData: this.mergeData(data.listData),
        current: (data.query.current === 'payment' || data.query.current === '') ? 'all' : data.query.current
      }
    });
  }

  private checkHasPersonalBizNumber = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {}).map((resp: { code: string; result: any; }) => {

      if (resp.code !== API_CODE.CODE_00) {
        this.paymentData.isPersonalBiz = false;
      } else {
        this.paymentData.isPersonalBiz = true;
        this.paymentData.personalBizNum = resp.result.taxReprintList ? resp.result.taxReprintList[0].ctzBizNum : '';
      }

      return null;
    });
  }

  private getAutoWithdrawalAccountInfo = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0070, {}).map((resp: { code: string; result: any }) => {
      if (resp.code === 'BIL0021' || resp.code === 'BIL0022') {
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

  private getAllPaymentData(req: Request, res: Response, next: NextFunction, query: Query, svcInfo: any) {
    Observable.combineLatest(
        this.checkHasPersonalBizNumber(),
        this.getAutoWithdrawalAccountInfo(),
        this.getOverAndRefundPaymentData(),
        this.getDirectPaymentData(),
        this.getAutoPaymentData(),
        this.getAutoUnitedPaymentData(),
        this.getMicroPaymentData(),
        this.getContentsPaymentData()
    ).subscribe(histories => {
      this.renderView(req, res, next, {query: query, listData: histories, svcInfo: svcInfo});
    });
  }

  private getOverAndRefundPaymentData = (current?: string): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      this.paymentData.overPaymentCount = parseInt(resp.result.ovrPayCnt, 10);
      this.paymentData.refundPaymentCount = parseInt(resp.result.rfndTotAmt, 10);
      // this.logger.info(this, resp.result.rfndTotAmt, FormatHelper.addComma(resp.result.rfndTotAmt.toString()));
      this.paymentData.refundTotalAmount = FormatHelper.addComma(resp.result.rfndTotAmt.toString());

      resp.result.refundPaymentRecord.map((o) => {
        o.sortDt = o.rfndReqDt;
        o.dataDt = DateHelper.getShortDateWithFormat(o.rfndReqDt, 'YYYY.MM.DD');
        o.dataOverpay = FormatHelper.addComma(o.ovrPay);
        o.dataRefundObjAmt = FormatHelper.addComma(o.rfndObjAmt);
        o.dataSumAmt = FormatHelper.addComma(o.sumAmt);
        o.dataRefundState = MYT_PAYMENT_HISTORY_REFUND_TYPE[o.rfndStat];
      });
      resp.result.overPaymentRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataDt = DateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD');
        o.dataAmt = FormatHelper.addComma(o.cardAmt);
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
        o.dataPayMethodCode = 'DI';
        o.dataTitle = o.cardCdNm;
        o.dataIsBankOrCard = this.isBankOrCard(o.dataTitle);
        o.listTitle = o.dataIsBank ? o.dataTitle + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.dataTitle;
        o.sortDt = o.opDt;
        o.dataDt = DateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD');
        o.dataAmt = FormatHelper.addComma(o.cardAmt);
        // o.dataReqAmt = FormatHelper.addComma(o.drwReqAmt);
        o.dataProcCode = MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE[o.cardProcCd];
        o.dataSettleWayCode = MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE[o.settleWayCd];
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.direct + (o.cardProcCd === 'N' ? '' + MYT_FARE_PAYMENT_HISTORY_TYPE.CANCEL_KOR_TITLE : '');
      });

      // this.logger.info(this, 'directPayment : .................>> ', resp.result);

      return resp.result;
    });
  }

  private getAutoPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0092, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.autoPaymentList = resp.result;

      resp.result.autoPaymentList.map((o) => {
        o.dataPayMethodCode = 'AT';
        o.dataTitle = o.bankCardCoCdNm;
        o.sortDt = o.drwDt;
        o.dataAmt = FormatHelper.addComma(o.drwAmt);
        o.dataRequestAmt = FormatHelper.addComma(o.drwReqAmt);
        o.dataIsBank = this.isBank(o.dataTitle);
        o.listTitle = o.dataIsBank ? o.dataTitle + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.dataTitle;
        o.dataDt = DateHelper.getShortDateWithFormat(o.drwDt, 'YYYY.MM.DD');
        o.dataCardBankNum = o.bankCardNum;
        o.dataLastInvDt = DateHelper.getShortDateWithFormat(o.lastInvDt, 'YYYY.MM.DD');
        o.dataSubInfo = o.drwErrCdNm;
        o.dataSubInfo2 = MYT_FARE_PAYMENT_HISTORY_TYPE.auto;
        o.dataTmthColClCd = MYT_PAYMENT_HISTORY_AUTO_TYPE[o.tmthColClCd];
      });

      // this.logger.info(this, 'autoPayment : .................>> ', resp.result);

      return resp.result;
    });
  }

  private getAutoUnitedPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0089, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.autoUnitedPaymentList = resp.result;

      resp.result.autoUnitedPaymentList.map((o) => {
        o.sortDt = o.drwDt;
        o.dataTitle = o.bankNm;
        o.dataPayMethodCode = 'AU';
        o.dataIsBank = this.isBank(o.dataTitle);
        o.listTitle = o.dataIsBank ? o.dataTitle + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.dataTitle;
        o.dataAmt = FormatHelper.addComma(o.drwAmt);
        o.dataDt = DateHelper.getShortDateWithFormat(o.drwDt, 'YYYY.MM.DD');
        o.dataDewAmtType = MYT_PAYMENT_HISTORY_AUTO_UNITED_TYPE[o.drwAmtTyp];
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.autoAll;
      });

      // this.logger.info(this, 'autoUnionPyment : .................>> ', resp.result);

      return resp.result;
    });
  }

  private getMicroPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0071, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.microPrepayRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataPayMethodCode = 'MP';
        o.dataIsBank = this.isBankOrCard(o.dataTitle);
        o.listTitle = o.dataIsBank ? o.dataTitle + ' ' + MYT_FARE_PAYMENT_HISTORY_TYPE.PAY_KOR_TITLE : o.dataTitle;
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD');
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.microPrepay;
        o.dataSubInfo2 = o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : null;
      });

      // this.logger.info(this, 'micropayment : .................>> ', resp.result);

      return resp.result;
    });
  }

  private getContentsPaymentData = (): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0078, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      resp.result.useContentsPrepayRecord.map((o) => {
        o.sortDt = o.opDt;
        o.dataPayMethodCode = 'CP';
        o.dataIsBank = this.isBankOrCard(o.dataTitle);
        o.dataAmt = FormatHelper.addComma(o.chrgAmt);
        o.dataDt = DateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD');
        o.dataSubInfo = MYT_FARE_PAYMENT_HISTORY_TYPE.contentPrepay;
        o.dataSubInfo2 = o.autoChrgYn === 'Y' ? MYT_FARE_PAYMENT_HISTORY_TYPE.AUTO_KOR_TITLE : null;
      });

      // this.logger.info(this, 'contentsPayment : .................>> ', resp.result);

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
        }

        if (cur.refundPaymentRecord && !prev.refundRecordList) {
          prev.refundRecordList = cur.refundPaymentRecord;
        }
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

  private isBank(o: string) {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK2) > 0)
        || (o.indexOf(MYT_FARE_PAYMENT_NAME.BANK3) > 0);
  }

  private isCard(o: string) {
    return (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD) > 0) || (o.indexOf(MYT_FARE_PAYMENT_NAME.CARD2) > 0);
  }

  private isBankOrCard(o: string) {
    return this.isBank(o) || this.isCard(o);
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
}

export default MyTFarePaymentHistory;
