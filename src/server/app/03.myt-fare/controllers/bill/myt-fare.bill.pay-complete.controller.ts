/**
 * @file myt-fare.bill.pay-complete.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.27
 * @desc 요금납부 및 선결제 완료 화면
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import ParamsHelper from '../../../../utils/params.helper';
import {MYT_FARE_COMPLETE_MSG} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';

/**
 * @class
 * @desc 요금납부 및 선결제 완료
 */
class MyTFareBillPayComplete extends TwViewController {
  /* [OP002-4676] 빈 함수는 필요없음
  constructor() {
    super();
  }
  */

  /**
   * @function
   * @desc render
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // [OP002-4676] 코드 단순화
    const params = ParamsHelper.getQueryParams(req.url); // req.query
    this.reqAutoPayments(params).subscribe(resp => {
      if (resp !== null && resp.code) {
        const {code, msg} = resp;
        return this.error.render(res, {
          code,
          msg,
          svcInfo,
          pageInfo
        });
      }
      const options = this._getData(resp, params);
      options.pageInfo = pageInfo;
      options.svcInfo = svcInfo;
      res.render('bill/myt-fare.bill.pay-complete.html', options);
    });
  }

  /**
   * @desc 자동납부정보 조회
   * @param params
   * @private
   */
  private reqAutoPayments(params: any): Observable<any> {
    // 즉시납부(계좌이체) 인 경우만
    if (!params || params.type !== 'account') {
      return Observable.of(null);
    }

    // 자동납부 방법 조회
    const getAutoPayments: () => Observable<any> = () => {
      return this.apiService.request(API_CMD.BFF_07_0060, {}).map( resp => {
        // 납부방법(01:은행,02:카드,03:지로,04:가상계좌) → 03,04 '자동납부 미 사용자'
        return resp.code === API_CODE.CODE_00 ? resp.result : resp;
      });
    };
    // 제휴카드 정보 조회
    const getAffiliatecard: () => Observable<any> = () => {
      return this.apiService.request(API_CMD.BFF_07_0102, {}).map( resp => {
        return resp.code === API_CODE.CODE_00 ? resp.result : resp;
      });
    };

    return getAutoPayments().switchMap( resp => {
      // code 는 실패일때만 있음.
      if (resp['code']) {
        return Observable.of(resp);
      }
      // 카드 인 경우. 제휴 카드 정보 조회한다.
      if (resp.payMthdCd === '02') {
        return getAffiliatecard().map( resp1 => {
          if (resp1['code']) {
            return resp1;
          }
          resp.joinCardYn =  resp1.join_card_yn; // 제휴카드 여부
          return resp;
        });
      }
      return Observable.of(resp);
    });
  }

  /**
   * @desc 자동납부 정보 데이터
   * @param data
   * @param resp
   * @param params
   * @private
   */
  private _getAutoPaymentsData(data, resp, params): any {
    if (params === null) {
      return;
    }
    const {type, amount, bankOrCardCode, bankOrCardName, bankOrCardAccn, cardNum} = params;
    Object.assign(data, {
      type,
      useTypeText: '',
      paymentOption: {},
      amount,
      amountFmt: FormatHelper.addComma(amount),
      // bankOrCardCode,
      bankOrCardName,
      bankOrCardAccn,
      cardNum
    });
    // 즉시납부(계좌이체) 가 아닌경우는 resp 가 null 이다. 이후 로직은 수행 불필요.
    if (resp === null) {
      return data;
    }
    const {CARD, JIRO, ONLY_ACCOUNT} = MYT_FARE_COMPLETE_MSG;
    const getUseType = payMthCd => {
      // 제휴카드 인 경우 공백 리턴
      if (resp.joinCardYn === 'Y') {
        return '';
      }
      const useType = {
        '02': CARD,
        '03': JIRO,
        '04': ONLY_ACCOUNT,
      };
      return useType[payMthCd];
    };
    data.joinCardYn = resp.joinCardYn;
    data.useTypeText = getUseType(resp.payMthdCd); // 자동납부 이용중인 타입(카드, 지로, 전용계좌)
    const {acntNum, payerNumClCd, serNum, authReqSerNum, rltmSerNum} = resp;
    // paymentOption : BFF_07_0060에서 조회 후 가지고 있다가 신청 및 변경 때 보낼 데이터
    data.paymentOption = {
      acntNum,
      payMthdCd: '01', // 01 : 은행계좌이체 , 02 : 카드
      payerNumClCd,
      serNum,
      authReqSerNum,
      rltmSerNum,
      bankCardNum: bankOrCardAccn,
      bankCardCoCd: bankOrCardCode
    };
    /* 이미 자동납부 신청이 되어 있는경우 (01:은행, 02:카드 인 경우만 자동납부 사용자임.) */
    const {BANK, CARD: CARD1} = MYT_FARE_PAYMENT_TYPE;
    if ([BANK, CARD1].indexOf(resp.payMthdCd) > -1) {
      data.paymentOption.fstDrwSchdDt = resp.fstDrwSchdDt;
    }

    return data;
  }

  /**
   * @function
   * @desc get data
   * @param {Object|null} params
   * @returns {any}
   * @private
   */
  private _getData(resp: any, params: any): any {
    // [OP002-4676] 코드 단순화
    const data = {
      mainTitle: MYT_FARE_COMPLETE_MSG.PAYMENT, // 메인 타이틀
      subTitle: '',
      description: '',
      centerName: MYT_FARE_COMPLETE_MSG.HISTORY, // 중간 링크 버튼이 있을 경우 버튼명
      centerUrl: '/myt-fare/info/history', // 중간 링크 클릭 시 이동할 대상
      confirmUrl: '/myt-fare/submain' // 하단 확인 버튼 클릭 시 이동할 대상
    };

    if (params !== null) {
      this._getAutoPaymentsData(data, resp, params);
      const type = params['type']; // 완료페이지에 쿼리스트링으로 추가된 정보
      if (type === 'sms') { // SMS 전송 완료일 경우
        return this._getSmsData(params, data); // 화면에 추가로 입력할 정보
      }
      if (type === 'small' || type === 'contents') { // 소액결제 및 콘텐츠이용료 선결제일 경우
        const subType = params['sub'];
        if (FormatHelper.isEmpty(subType)) {
          return this._getPrepayData(data, type); // 선결제
        }
        return this._getAutoPrepayData(data, type, subType); // 자동선결제
      }
    }
    return data;
  }

  /**
   * @function
   * @desc SMS 전송완료 화면일 경우 추가 정보
   * @param queryObject
   * @param data
   * @returns {any}
   * @private
   */
  private _getSmsData(queryObject: any, data: any): any {
    const svcNum = queryObject['svcNum']; // 전송된 휴대폰 번호
    data.mainTitle = MYT_FARE_COMPLETE_MSG.SMS;
    data.subTitle = FormatHelper.isEmpty(svcNum) ? '' : svcNum + ' ' + MYT_FARE_COMPLETE_MSG.NUMBER;
    data.description = MYT_FARE_COMPLETE_MSG.SMS_DESCRIPTION;
    data.centerName = '';

    return data;
  }

  /**
   * @function
   * @desc get prepay data (선결제)
   * @param data
   * @param type
   * @returns {any}
   * @private
   */
  private _getPrepayData(data: any, type: any): any {
    data.mainTitle = MYT_FARE_COMPLETE_MSG.PREPAY;
    data.centerName = MYT_FARE_COMPLETE_MSG.PREPAY_HISTORY; // 요금납부내역 조회
    if (type === 'small') {
      data.centerUrl += '?sortType=micro-prepay'; // 소액결제일 경우 소액결제내역 조회
    } else {
      data.centerUrl += '?sortType=content-prepay'; // 콘텐츠이용료일 경우 콘텐츠이용료 내역 조회
    }
    data.confirmUrl = '/myt-fare/bill/' + type; // 확인 버튼 클릭 시 소액결제 또는 콘텐츠이용료 메인화면으로 이동

    return data;
  }

  /**
   * @function
   * @desc get auto prepay data (자동선결제)
   * @param data
   * @param type
   * @param subType
   * @returns {any}
   * @private
   */
  private _getAutoPrepayData(data: any, type: any, subType: any): any {
    if (subType === 'auto') {
      data.mainTitle = MYT_FARE_COMPLETE_MSG.REGISTER; // 자동선결제
      data.centerName = '';
    } else {
      if (subType === 'cancel') {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CANCEL; // 자동선결제 해지
        data.centerName = MYT_FARE_COMPLETE_MSG.CANCEL_HISTORY; // 해지내역 조회
      } else {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CHANGE; // 자동선결제 변경
        data.centerName = MYT_FARE_COMPLETE_MSG.CHANGE_HISTORY; // 변경내역 조회
      }
      data.centerUrl = '/myt-fare/bill/' + type + '/auto/info'; // 자동선결제 신청 및 변경 내역 조회
    }
    data.confirmUrl = '/myt-fare/bill/' + type; // 확인 버튼 클릭 시 소액결제 또는 콘텐츠이용료 메인화면으로 이동

    return data;
  }
}

export default MyTFareBillPayComplete;
