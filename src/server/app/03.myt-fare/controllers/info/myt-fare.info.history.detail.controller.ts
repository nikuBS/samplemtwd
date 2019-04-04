/**
 * @file myt-fare.info.history.detail.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_PAYMENT_DETAIL_TITLE, 
  MYT_PAYMENT_DETAIL_ERROR, 
  MYT_FARE_PAYMENT_HISTORY_TYPE, 
  MYT_FARE_PAYMENT_NAME,
  MYT_FARE_PAYMENT_TYPE
} from '../../../../types/string.type';

import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_PAYMENT_HISTORY_AUTO_TYPE, MYT_FARE_PAYMENT_CODE, 
  MYT_FARE_POINT_PAYMENT_STATUS, 
  MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE,
  MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING,
  MYT_FARE_PAYMENT_PROCESS_DATE,
  MYT_FARE_PAYMENT_PROCESS_ATM
} from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';

interface Query {
  current: string;
  isQueryEmpty: boolean;
  // sortType: string;
}

interface RenderObj {
  req: Request;
  res: Response;
  next: NextFunction;
  svcInfo: any;
  pageInfo: any;
  current?: string;
  innerIndex?: any;
  opDt?: string;
  payOpTm?: string;
}


class MyTFareInfoHistoryDetail extends TwViewController {
  constructor() {
    super();
  }

  renderURL;
  isPersonalBiz;
  billCnt;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };
    const renderObj: RenderObj = {
      req, 
      res, 
      next, 
      svcInfo, 
      pageInfo, 
      current: query.current,
      innerIndex: (req && req.query && req.query.innerIndex !== undefined) ? req.query.innerIndex : ''
    };
    this.renderURL = 'info/myt-fare.info.history.detail.html';
    
    switch (req.query.type) {
      case MYT_FARE_PAYMENT_TYPE.DIRECT:
        const {opDt, payOpTm} = req.query;
        this.includeBillHistory(this.getDirectPaymentData, Object.assign(renderObj, {opDt, payOpTm}));
        break;
      case MYT_FARE_PAYMENT_TYPE.AUTOALL:
        // 통합인출납부
        this.includeBillHistory(this.getAutoUnitedPaymentData, renderObj);
        break;
      case MYT_FARE_PAYMENT_TYPE.MICRO:
        // 소액결제 선결제
        this.getMicroPaymentData(renderObj);
        break;
      case MYT_FARE_PAYMENT_TYPE.CONTENT:
        // 컨텐츠 선결제
        this.getContentsPaymentData(renderObj);
        break;
      case MYT_FARE_PAYMENT_TYPE.AUTO:
        // 자동납부         
        this.includeBillHistory(this.getAutoPaymentData, renderObj);
        break;
      case MYT_FARE_PAYMENT_TYPE.PRESERVE:
        // 포인트 1회 납부예약
        this.getPointReservePaymentData(renderObj);
        break;
      case MYT_FARE_PAYMENT_TYPE.PAUTO:
       // 포인트 자동납부
       this.getPointAutoPaymentData(renderObj);
       break;
      default:
        res.render(this.renderURL, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          data: {
            current: query.current,
            headerTitle: MYT_PAYMENT_DETAIL_TITLE.DI
          }
        });
        break;
    }
  }

  // 사업자 여부, 세금계산서 / 현금영수증 조회 포함 (계좌이체 일 경우 해당함)
  private includeBillHistory = (callback, renderObj) => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'H'}).subscribe((resp: { code: string; result: any; }) => {
      // let isPersonalBiz; 
      if (resp.code !== API_CODE.CODE_00) {
        this.isPersonalBiz = false;
        // 현금영수증 조회
        this.checkCashBill(callback, renderObj);
      } else {
        this.isPersonalBiz = true;
        // 사업자회원일경우 세금계산서 갯수 계산 로직 우선 수행 19.1.3
        this.getBizTaxCnt(callback, renderObj);
      }
    });
  };
  
  // 현금영수증 내역 조회
  private checkCashBill = (callback, renderObj) => {
    return this.apiService.request(API_CMD.BFF_07_0004, {}).subscribe(response => {
      if (response.code === API_CODE.CODE_00) {
        this.billCnt = response.result.length ;
      }
      callback.call(this, renderObj);
    });
  };

  // 즉시납부
  private getDirectPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, opDt, payOpTm } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0091, {opDt, payOpTm}).subscribe((resp) => {

      
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }

      const resultData = resp.result; 
            
      resultData.dataAmt = FormatHelper.addComma(resultData.cardAmt); // 납부금액
      resultData.invYearMonth = DateHelper.getYearNextMonthFromDate(resultData.invDt), // 납부내용 (청구년월: 청구일자의 익월(다음달)) YYYY.M.
      resultData.invYearNoDotMonth = DateHelper.getYearNextNoDotMonthFromDate(resultData.invDt), // 납부내용 (청구년월: 청구일자의 익월(다음달)) YYYY.M
      resultData.dataProcCode = MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE[resultData.cardProcCd]; // 요청결과
      resultData.reqDate = DateHelper.getShortDate(parseFloat(resultData.reqDtm) ? resultData.reqDtm : opDt); // 요청일시
      resultData.comDate = DateHelper.getShortDate(resultData.opDt); // 납부일자
      resultData.dataIsBankOrCard = this.isBankOrCard(resultData.cardCdNm) || this.isBankOrCard(resultData.settleWayCd); // 카드 or 계좌 여부
      resultData.dataSettleWayCode = MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE[resultData.settleWayCd]; // 포인트 종류 (포인트일경우)
      resultData.dataPayType = this.checkPayType(resultData.settleWayCd); // 즉시납부 종류 (카드, 포인트, 은행, 기타)

      this.renderView(renderObj, Object.assign(resultData, {
        isPersonalBiz: this.isPersonalBiz,
        isBillCnt: this.billCnt > 0
      }));

    });
  }

  // 자동납부
  private getAutoPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0092, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }

      resultData.dataDt = DateHelper.getShortDate(resultData.drwDt); // 납부일자 YYYY.M.D.
      resultData.dataAmt = FormatHelper.addComma(resultData.drwAmt); // 납부금액 
      resultData.dataRequestAmt = FormatHelper.addComma(resultData.drwReqAmt); // 청구금액
      resultData.dataReqYearMonth = DateHelper.getYearNextMonthFromDate(resultData.lastInvDt); // 청구년월 YYYY.M.
      resultData.dataUseTermStart = DateHelper.getShortFirstDate(resultData.lastInvDt); // 이용기간 YYYY.M.1.
      resultData.dataLastInvDt = DateHelper.getShortDate(resultData.lastInvDt); // 이용기간 ~ YYYY.M.D.
      resultData.dataIsBank = !this.isCard(resultData.bankCardCoCdNm); // 은행인지 여부(텍스트로 판단)
      resultData.dataTitle = resultData.bankCardCoCdNm; // 은행명 / 카드사명
      resultData.dataCardBankNum = resultData.bankCardNum; // 계좌번호 / 카드번호
      resultData.dataTmthColClCd = MYT_PAYMENT_HISTORY_AUTO_TYPE[resultData.tmthColClCd]; // 구분

      this.renderView(renderObj, Object.assign(resultData, {
        isPersonalBiz: this.isPersonalBiz,
        isBillCnt: this.billCnt > 0
      }));
      
    });     
  }

  // 통합납부
  private getAutoUnitedPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0089, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }

      resultData.dataDt = DateHelper.getShortDate(resultData.drwDt); // 납부일자 YYYY.M.D.
      resultData.dataAmt = FormatHelper.addComma(resultData.drwAmt); // 납부금액 
      resultData.dataTmthColClCd = MYT_PAYMENT_HISTORY_AUTO_TYPE[resultData.tmthColClCd]; // 구분
      resultData.dataDtTitle = MYT_FARE_PAYMENT_PROCESS_DATE[resultData.drwAmtTyp] || '';
      resultData.dataAmtTitle = MYT_FARE_PAYMENT_PROCESS_ATM[resultData.drwAmtTyp] || '';
      
      this.renderView(renderObj, Object.assign(resultData, {
        isPersonalBiz: this.isPersonalBiz,
        isBillCnt: this.billCnt > 0
      }));
    });
  }

  // 소액결제 선결제
  private getMicroPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0071, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result.microPrepayRecord[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }

      resultData.dataFullDt = DateHelper.getFullDateAndTime(resultData.opDt + resultData.payOpTm); // 결제일자
      resultData.dataAmt = FormatHelper.addComma(resultData.chrgAmt); // 선결제 금액
      resultData.listTitle = resultData.settlWayNm; // 결제수단
      resultData.isAutoCharg = (resultData.autoChrgYn === 'Y'); // 상세내역에서 기준납부 영역 노출여부를 결정
      
      this.renderView(renderObj, resultData);
    });
  }

  // 콘텐츠 선결제
  private getContentsPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0078, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result.useContentsPrepayRecord[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }
    
      resultData.dataFullDt = DateHelper.getFullDateAndTime(resultData.opDt + resultData.payOpTm); // 결제일자
      resultData.dataAmt = FormatHelper.addComma(resultData.chrgAmt); // 선결제금액
      
      this.renderView(renderObj, resultData);
    });
  }


  // 포인트 자동납부
  private getPointAutoPaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0094, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }

      resultData.dataAmt = FormatHelper.addComma(resultData.point); // 신청포인트
      resultData.payComplete = (MYT_FARE_POINT_PAYMENT_STATUS.COMPLETE === resultData.reqSt || 
                                MYT_FARE_POINT_PAYMENT_STATUS.COMPLETE2 === resultData.reqSt); // 납부완료여부
      resultData.dataDt = DateHelper.getShortDate(resultData.opDt); // 처리 일자
      
      this.renderView(renderObj, resultData);
    });
  }

  // 포인트 납부예약
  private getPointReservePaymentData(renderObj: RenderObj) {
    const { res, svcInfo, pageInfo, innerIndex } = renderObj;
    return this.apiService.request(API_CMD.BFF_07_0093, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
         return this._renderError(resp.code, resp.msg, res, svcInfo, pageInfo);
      }
      // index
      const resultData = resp.result[innerIndex || 0];

      if (!resultData || !innerIndex) {
        return this._renderError(resp.code, MYT_PAYMENT_DETAIL_ERROR.MSG, res, svcInfo, pageInfo);
      }

      resultData.dataDt = DateHelper.getShortDate(resultData.opDt); // 신청일자
      resultData.dataAmt = FormatHelper.addComma(resultData.point); // 예약 포인트
      resultData.listTitle = resultData.pointNm; // 포인트 종류
      
      this.renderView(renderObj, resultData);
    });
  }

  // 사업자 회원 세금계산서 갯수 계산 .. 19.1.3 반기옵션으로 
  // 단순 조회시에는 1-6/7-12월로만 조회되는 이슈
  private getBizTaxCnt = (callback, renderObj) => {
    return Observable.combineLatest(
      this.getBillTaxLists(DateHelper.getCurrentDate(), 6)
    ).subscribe(taxlist => {      
      this.billCnt = (taxlist || []).reduce((prev, cur) => {
        return prev + (cur ? cur.length : 0);
      }, 0);
      callback.call(this, renderObj); // 이후 콜백
    });
  };

  private getBillTaxLists = (date: Date, monthPeriod: number) => {
    // monthPeriod 개월 전 구하기
    date.setDate(1);
    date.setMonth(date.getMonth() - monthPeriod);
    const list: any[] = [];
    for ( let i = 0; i < monthPeriod; i++) {
      list.push(this.getBillTaxList(DateHelper.getCurrentShortDate(new Date(date)).substring(0, 6)));
      date.setMonth(date.getMonth() + 1);
    }
    return list; 
  };

  private getBillTaxList = (date: string): Observable<any | null> => {
    return this.apiService.request(API_CMD.BFF_07_0017, {selType: 'M', selSearch: date}).map((resp: {code: string, msg: string, result: any}) => {
      if (resp.code !== API_CODE.CODE_00) {
        return [];
      }
      return resp.result.taxReprintList;
    });
  };
  // 사업자 회원 세금계산서 갯수 계산 end

  // 렌더링
  private renderView(renderObj: RenderObj, content) {
    const { res, svcInfo, pageInfo, current } = renderObj;
    res.render(this.renderURL, {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: {
        current,
        headerTitle: MYT_PAYMENT_DETAIL_TITLE.DI,
        content
      }
    });
  }

  // 오류 페이지
  private _renderError(code, msg, res, svcInfo, pageInfo) {
    return this.error.render(res, {
      code,
      msg,
      svcInfo,
      pageInfo
    });
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
}

export default MyTFareInfoHistoryDetail;
