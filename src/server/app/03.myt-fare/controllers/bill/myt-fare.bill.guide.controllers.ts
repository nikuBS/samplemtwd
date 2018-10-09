/**
 * FileName: myt-fare.bill.guide.controller.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import bill_guide_BFF_05_0036 from '../../../../mock/server/bill.guide.BFF_05_0036.mock';
import bill_guide_BFF_05_0049 from '../../../../mock/server/bill.guide.BFF_05_0049.mock';
import bill_guide_BFF_05_0024 from '../../../../mock/server/bill.guide.BFF_05_0024.mock';
import { MYT_FARE_BILL_GUIDE } from '../../../../types/string.type';

class MyTFareBillGuide extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;  // 쿼리스트링
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036 , 사용요금조회 | BFF_05_0047
  // private _useFeeInfo: any = {}; // 사용요금조회 | BFF_05_0047
  private _intBillLineInfo: any = {}; // 통합청구등록회선조회 | BFF_05_0049
  private _unpaidBillsInfo: any = {}; // 미납내역 조회 | BFF_05_0030
  private _childLineInfo: any = {}; // 자녀회선 조회 | BFF_05_0024
  private _ppsInfo: any; // PPS 요금안내서 정보조회

  // 공통데이터
  private _commDataInfo: any = {
    selClaimDt: '', // 선택 청구 월 | 2017년 10월
    selClaimDtM: '', // 선택 청구 월 | number
    selStaDt: '', // 선택시작
    selEndDt: '', // 선택끝
    discount: '', // 할인액
    joinSvcList: '', // 가입 서비스 리스트
    useAmtTot: '', // 사용요금

    intBillLineList: '', // 조건변경 > 회선
    conditionChangeDtList: '', // 조건변경 > 기간
    repSvcNm: '', // 대표서비스회선정보

    prodNm: '', // pps 요금제
    prodAmt: '', // pps 잔액
    useEndDt: '', // pps 발신/사용기간
    dataKeepTrmDt: '', // pps 수신/데이터유지기간
    numKeepTrmDt: '', // pps 번유지기간
    curDt: '', // 현재날짜
    remained: '', // 잔여데이터 KB | 공백일 경우 표시안함
    dataYn: '', // 음성+데이터 'Y'
    dataProdYn: '', // MB 'Y' | 원 'N'

    ppsType: '', // pps 요금제 종류 'A', 'B', 'C'
    ppsProdAmt: '', // 카드잔액(원/mb)
    ppsRemained: '', // 잔여대이터(kb)
    ppsObEndDt: '', // 발신종료일자
    ppsInbEndDt: '', // 수신종료일자
    ppsNumEndDt: '', // 번호유지종료일자
    ppsCurDate: '', // 현재시간
    ppsStartDateVal: '',
    ppsStartDateTxt: '',
    ppsEndDateVal: '',
    ppsEndDateTxt: ''
  };

  // 노출조건
  private _showConditionInfo: any = {
    autopayYn: null, // 자동납부신청
    nonPaymentYn: null, // 납부전
    selectNonPaymentYn: null, // 선택한 월에  납부완료 Y or N

    childYn: null, // 자녀회선
    phoneYn: null, // 선택회선이 휴대폰
    chargeTtYn: null, // 요금제: "T끼리 T내는 요금" prodId : "NA00001901"
    paymentBtnYn: null, // 납부가능일 버튼
    suspensionYn: null // 이용정지해제 버튼
  };

  private _urlTplInfo: any = {
    combineRepresentPage: 'bill/myt-fare.bill.guide.integrated-rep.html', // 통합청구(대표)
    combineCommonPage: 'bill/myt-fare.bill.guide.integrated-normal.html', // 통합청구(일반)
    individualPage: 'bill/myt-fare.bill.guide.individual.html', // 개별청구
    prepaidPage: 'bill/myt-fare.bill.guide.pps.html', // PPS(선불폰)
    companyPage: 'bill/myt-fare.bill.guide.solution.html', // 기업솔루션(포인트캠)
    skbroadbandPage: 'bill/myt-fare.bill.guide.skbd.html' // sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any) {
    const thisMain = this;
    this.reqQuery = req.query;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);
    // ---------------------------------------------------------------------------------[화면 구분]
    /*
    * A1. 선불폰 | svcInfo.svcAttrCd : M2
    * A2. 기업솔루션 | svcInfo.svcAttrCd : O1
    * A3. SK브로드밴드 가입 | this._billpayInfo.coClCd | 'B' | 에러
    * A4. 개별청구회선 | this._billpayInfo.paidAmtMonthSvcCnt === 1
    * A5. 통합청구회선 대표 | this._billpayInfo.repSvcYn === 'Y'
    * A6. 통합청구회선 대표아님 |
     */
     const promiseTypeChk = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, {}), 'promiseTypeChk');
    // const promiseTypeChk = this._getPromiseApiMock(bill_guide_BFF_05_0036, 'promiseTypeChk');

    switch ( svcInfo.svcAttrCd ) {
      case 'M2' :
        this.logger.info(this, '[ PPS(선불폰) ] : ', svcInfo.svcAttrCd);
        this._typeChk = 'A1';
        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
        thisMain.controllerInit(res, svcInfo, allSvc, childInfo);
        break;
      case 'O1' :
        this.logger.info(this, '[ 기업솔루션(포인트캠) ]', svcInfo.svcAttrCd);
        this._typeChk = 'A2';
        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
        thisMain.controllerInit(res, svcInfo, allSvc, childInfo);
        break;
      default :

          this.logger.info(this, '[ PPS, 기업솔루션이 아닌경우 ]');

          Promise.all([promiseTypeChk]).then(function(resArr) {
            thisMain.logger.info(thisMain, `[ Promise.all > success ] : `, resArr);
            thisMain._billpayInfo = resArr[0].result;

            if ( thisMain._billpayInfo.coClCd === 'B' ) {
              thisMain.logger.info(thisMain, '[ SK브로드밴드 가입 ]', thisMain._billpayInfo.coClCd);
              thisMain._typeChk = 'A3';
            } else {
              if ( thisMain._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
                thisMain.logger.info(thisMain, '[ 개별청구회선 ]', thisMain._billpayInfo.paidAmtMonthSvcCnt);
                thisMain._typeChk = 'A4';
              } else {
                if ( thisMain._billpayInfo.repSvcYn === 'Y' ) {
                  thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 ]', thisMain._billpayInfo.repSvcYn);
                  thisMain._typeChk = 'A5';
                } else {
                  thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
                  thisMain._typeChk = 'A6';
                }
              }
            }
            thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
            thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);

            thisMain.controllerInit(res, svcInfo, allSvc, childInfo);

          }, function(err) {
            thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
            return thisMain.error.render(res, {
              title: 'title',
              code: err.code,
              msg: err.msg,
              svcInfo: svcInfo
            });
          });

    }

    // thisMain.renderView(res, thisMain._urlTplInfo.combineRepresentPage, {
    //   reqQuery: thisMain.reqQuery,
    //   svcInfo: svcInfo,
    // });

  }

  // ---------------------------------------------------------------------------------[초기화 분기처리]
  private controllerInit(res, svcInfo, allSvc, childInfo) {

    switch ( this._typeChk ) {
      case 'A1' :
        this.logger.info(this, '[ PPS 선불폰 controllerInit ] A1 : ', this._typeChk);
        this.prepaidCircuit(res, svcInfo, allSvc, childInfo);
        break;
      case 'A2' :
        this.logger.info(this, '[ 기업솔루션 controllerInit ] A2 : ', this._typeChk);
        this.companyCircuit(res, svcInfo, allSvc, childInfo);
        break;
      case 'A3' :
        this.logger.info(this, '[ SK브로드밴드 가입 controllerInit ] A3 : ', this._typeChk);
        this.skbroadbandCircuit(res, svcInfo, allSvc, childInfo);
        break;
      case 'A4' :
        this.logger.info(this, '[ 개별청구회선 controllerInit ] A4 : ', this._typeChk);
        this.individualCircuit(res, svcInfo, allSvc, childInfo);
        break;
      case 'A5' :
        this.logger.info(this, '[ 통합청구회선-대표 controllerInit ] A5 : ', this._typeChk);
        this.combineRepresentCircuit(res, svcInfo, allSvc, childInfo);
        break;
      case 'A6' :
        this.logger.info(this, '[ 통합청구회선-일반 controllerInit ] A6 : ', this._typeChk);
        this.combineCommonCircuit(res, svcInfo, allSvc, childInfo);
        break;
      default :

    }
  }

  // 통합청구(대표)
  private combineRepresentCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
    this.reqQuery.line = (this.reqQuery.line) ? this.reqQuery.line : '';
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';
    let p1;
    /*
    * 실 데이터
    */
    if ( this.reqQuery.line ) {
      p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0047, {
        invDt: this.reqQuery.date,
        sSvcMgmtNum: this.reqQuery.line
      }), 'p1');
    } else {
      p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, {
        invDt: this.reqQuery.date
      }), 'p1');
    }

    const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0049, {}), 'p2'); // 통합청구등록회선조회
    const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0030, {}), 'p3'); // 미납내역조회
    /*
    p1 = this._getPromiseApiMock(bill_guide_BFF_05_0036, 'p1');
    const p2 = this._getPromiseApiMock(bill_guide_BFF_05_0049, 'p2');
    const p3 = this._getPromiseApiMock(bill_guide_BFF_05_0024, 'p3');
    */

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (!thisMain.reqQuery.line) ? thisMain.paidAmtSvcCdListFun() : null;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun() : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;
      thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';

      thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();
    };

    Promise.all([p1, p2, p3]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      thisMain._unpaidBillsInfo = resArr[2].result;
      thisMain._childLineInfo = childInfo;

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);

      thisMain.renderView(res, thisMain._urlTplInfo.combineRepresentPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        showConditionInfo: thisMain._showConditionInfo,
        unpaidBillsInfo: thisMain._unpaidBillsInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        svcInfo: svcInfo
      });
    });

  }

  // 통합청구(일반)
  private combineCommonCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0047, {
      invDt: this.reqQuery.date
    }), 'p1');
    const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0049, {}), 'p2'); // 통합청구등록회선조회

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun() : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain._commDataInfo.repSvcNm = (thisMain._billpayInfo) ? thisMain.phoneStrToDash( thisMain._billpayInfo.repSvcNm ) : null;


    };

    Promise.all([p1, p2]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      thisMain._childLineInfo = childInfo;

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);
      thisMain.renderView(res, thisMain._urlTplInfo.combineCommonPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        svcInfo: svcInfo
      });
    });
  }

  // 개별청구
  private individualCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, {
      invDt: this.reqQuery.date
    }), 'p1');
    const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0049, {}), 'p2'); // 통합청구등록회선조회
    const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0030, {}), 'p3'); // 미납내역조회

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun() : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;
      thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';

    };

    Promise.all([p1, p2, p3]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      thisMain._unpaidBillsInfo = resArr[2].result;
      thisMain._childLineInfo = childInfo;

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.individualPage] : ', thisMain._urlTplInfo.individualPage);
      thisMain.renderView(res, thisMain._urlTplInfo.individualPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        showConditionInfo: thisMain._showConditionInfo,
        unpaidBillsInfo: thisMain._unpaidBillsInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        svcInfo: svcInfo
      });
    });
  }
  // PPS 선불폰
  private prepaidCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0013, {
      invDt: this.reqQuery.date
    }), 'p1');

    const dataInit = function () {

      if ( thisMain._ppsInfo.dataYn === 'N' && thisMain._ppsInfo.dataOnlyYn === 'Y' ) { // 데이터 요금제 'A'
        thisMain._commDataInfo.ppsType = 'A';
      } else if ( thisMain._ppsInfo.dataYn === 'N' && thisMain._ppsInfo.dataOnlyYn === 'N' ) { // 음성 요금제 'B'
        thisMain._commDataInfo.ppsType = 'B';
      } else if ( thisMain._ppsInfo.dataYn === 'Y' && thisMain._ppsInfo.dataOnlyYn === 'N' ) { // 음성 + 데이터 요금제 'C'
        thisMain._commDataInfo.ppsType = 'C';
      }

      thisMain._commDataInfo.ppsProdAmt = FormatHelper.addComma( thisMain._ppsInfo.prodAmt );
      thisMain._commDataInfo.ppsRemained = FormatHelper.addComma( thisMain._ppsInfo.prodAmt );
      thisMain._commDataInfo.ppsObEndDt = moment(thisMain._ppsInfo.obEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsInbEndDt = moment(thisMain._ppsInfo.inbEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsNumEndDt = moment(thisMain._ppsInfo.numEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsCurDate = thisMain.getCurDate();

      thisMain._commDataInfo.ppsStartDateVal = thisMain.getStartDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsStartDateTxt = thisMain.getStartDateFormat('YYYY.MM');

      thisMain._commDataInfo.ppsEndDateVal = thisMain.getEndDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsEndDateTxt = thisMain.getEndDateFormat('YYYY.MM');
    };

    Promise.all([p1]).then(function(resArr) {

      thisMain._ppsInfo = resArr[0].result;

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.prepaidPage] : ', thisMain._urlTplInfo.prepaidPage);
      thisMain.renderView(res, thisMain._urlTplInfo.prepaidPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        ppsInfo: thisMain._ppsInfo,
        commDataInfo: thisMain._commDataInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        svcInfo: svcInfo
      });
    });
  }
  // 기업솔루션
  private companyCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
  }
  // SK브로드밴드가입
  private skbroadbandCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
  }

  // -------------------------------------------------------------[SVC]
  public getSelectNonPayment(): any {
    const thisMain = this;
    const unPaidAmtMonthInfoList = thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList;
    const queryDate = thisMain.reqQuery.date;

    if ( unPaidAmtMonthInfoList.length ) {
      return 'N';
    }

    let dateVal;
    if ( queryDate ) {
      dateVal = queryDate;
    } else {
      dateVal = thisMain._billpayInfo.invDt;
    }

    /*
    * test
     */
    // const unPaidAmtMonthInfoList = [
    //   {unPaidInvDt: '20180831', unPaidAmt: '890090'},
    //   {unPaidInvDt: '20180731', unPaidAmt: '790090'},
    //   {unPaidInvDt: '20180631', unPaidAmt: '690090'},
    //   {unPaidInvDt: '20180531', unPaidAmt: '590090'}
    // ];
    // dateVal = '20180731';


    let result;
    result = unPaidAmtMonthInfoList.filter( function(item) {
      return item.unPaidInvDt === dateVal;
    });

    this.logger.info(this, '[ 필터 > result ] : ', result);

    if ( result.length > 0 ) {
      result = 'Y';
    } else {
      result = 'N';
    }

    return result;
  }

  public getCurDate(): any {
    return moment().format('YYYY.MM.DD hh:mm');
  }

  public getStartDateFormat(formatStr): any {
    return moment().subtract('1', 'months').startOf('month').format(formatStr);
  }

  public getEndDateFormat(formatStr): any {
    return moment().subtract('1', 'months').endOf('month').format(formatStr);
  }

  public getSelStaDt(date: string): any { // 월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).startOf('month').format('YYYY.MM.DD');
  }

  public getSelEndDt(date: string): any { // 월 끝나는 일 구하기
    return this._commDataInfo.selEndDt = moment(date).endOf('month').format('MM.DD');
  }

  public getSelClaimDt(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format( MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
  }

  public getSelClaimDtM(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDtM = moment(date).add(1, 'days').format('M');
  }

  public intBillLineFun() {
    const thisMain = this;
    const svcTotList = thisMain._intBillLineInfo.slice();
    svcTotList.unshift({ svcType: MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE } );

    svcTotList.map( function (item, idx, arr) {
      if ( idx !== 0 && item.svcType === MYT_FARE_BILL_GUIDE.PHONE_SVCTYPE ) {
        item.label = thisMain.phoneStrToDash( item.svcNum );
      } else {
        item.label = item.dtlAddr;
      }
      return item;
    });

    return svcTotList;
  }

  public conditionChangeDtListFun() {
    const thisMain = this;
    let dtList = thisMain._billpayInfo.invDtArr.slice();

    dtList = dtList.map(function (item, idx, arr) {
      item = moment(item).add(1, 'days').format( MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
      return item;
    });

    return dtList;
  }

  public paidAmtSvcCdListFun() {
    const thisMain = this;
    console.log('에러 확인 > thisMain._billpayInfo.paidAmtSvcCdList');
    console.dir(thisMain._billpayInfo.paidAmtSvcCdList);
    let paidAmtSvcCdList = thisMain._billpayInfo.paidAmtSvcCdList.slice();
    paidAmtSvcCdList = paidAmtSvcCdList.map(function (item, idx, arr) {
      item.amt = FormatHelper.addComma(item.amt);

      if ( item.svcNm === MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
        item.svcNm = MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
      }

      return item;
    });

    console.log('에러 확인 2 > thisMain._billpayInfo.paidAmtSvcCdList');
    console.dir( paidAmtSvcCdList );

    return paidAmtSvcCdList;

  }


  // 별표가 있는 휴대폰 번호 대시 적용
  public phoneStrToDash(strCellphoneNum: string): string {
    return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  }

  public getCircuitChildInfoMask(obj: any): any { // 휴대폰 마스킹 처리

    if ( obj.length !== 0 ) {

      this._commDataInfo.subChildBillInfo = obj.map(item => {

        let phoneNum_0 = item.svcNum.substr(0, 3);
        let phoneNum_1 = item.svcNum.substr(3, 4);
        let phoneNum_2 = item.svcNum.substr(7, 4);

        phoneNum_0 = StringHelper.masking(phoneNum_0, '*', 0);
        phoneNum_1 = StringHelper.masking(phoneNum_1, '*', 2);
        phoneNum_2 = StringHelper.masking(phoneNum_2, '*', 2);

        return item.svcNum = phoneNum_0 + '-' + phoneNum_1 + '-' + phoneNum_2;

      });
    }
  }

  // -------------------------------------------------------------[프로미스 생성]
  public _getPromiseApi(reqObj, msg): any {
    const thisMain = this;
    const reqObjObservableApi: Observable<any> = reqObj;

    return new Promise((resolve, reject) => {
      Observable.combineLatest(
        reqObjObservableApi
      ).subscribe((resp) => {
        thisMain.logger.info(thisMain, `[ ${ msg } next ] : `, resp);

        if ( resp[0].code === API_CODE.CODE_00 ) {
          resolve(resp[0]);
        } else {
          reject(resp[0]);
        }

      });
    });

  }
  // -------------------------------------------------------------[프로미스 생성 - Mock]
  public _getPromiseApiMock(mockData, msg): any {
    return new Promise((resolve, reject) => {
      const ms: number = Math.floor(Math.random() * 1000) + 1;
      setTimeout(function () {
        console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);

        if ( mockData.code === API_CODE.CODE_00 ) {
          resolve(mockData);
        } else {
          reject(mockData);
        }

      }, ms);
    });
  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }

}

export default MyTFareBillGuide;
