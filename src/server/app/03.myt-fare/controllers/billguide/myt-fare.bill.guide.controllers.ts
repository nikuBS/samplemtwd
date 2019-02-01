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
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE, MYT_JOIN_WIRE_SVCATTRCD } from '../../../../types/string.type';

class MyTFareBillGuide extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;  // 쿼리스트링
  public pageInfo: any;
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
    combineRepresentPage: 'billguide/myt-fare.bill.guide.integrated-rep.html', // 통합청구(대표)
    combineCommonPage: 'billguide/myt-fare.bill.guide.integrated-normal.html', // 통합청구(일반)
    individualPage: 'billguide/myt-fare.bill.guide.individual.html', // 개별청구
    prepaidPage: 'billguide/myt-fare.bill.guide.pps.html', // PPS(선불폰)
    companyPage: 'billguide/myt-fare.bill.guide.solution.html', // 기업솔루션(포인트캠)
    skbroadbandPage: 'billguide/myt-fare.bill.guide.skbd.html' // sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;

    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);
    this.logger.info(this, '[ childInfo ] : ', childInfo);
    allSvc = allSvc || { 's': [], 'o': [], 'm': [] };

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
        this.prepaidCircuit(res, svcInfo, allSvc, childInfo);

        break;
      case 'O1' :
        this.logger.info(this, '[ 기업솔루션(포인트캠) ]', svcInfo.svcAttrCd);
        this._typeChk = 'A2';
        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
        this.companyCircuit(res, svcInfo, allSvc, childInfo);
        break;
      default :

        this.logger.info(this, '[ PPS, 기업솔루션이 아닌경우 ]');

        Promise.all([promiseTypeChk]).then(function(resArr) {
          thisMain.logger.info(thisMain, `[ Promise.all > success ] : `, resArr);
          thisMain._billpayInfo = resArr[0].result;

          if ( thisMain._billpayInfo.coClCd === 'B' ) {
            thisMain.logger.info(thisMain, '[ SK브로드밴드 가입 ]', thisMain._billpayInfo.coClCd);
            thisMain._typeChk = 'A3';
            // TODO: 사업자가 브로드밴드인 경우 이용요금을 조회하여 화면 노출 작업 필요 (SB 선행 작업 후)
            // thisMain.combineCommonCircuit(res, svcInfo, allSvc, childInfo);
            thisMain.skbroadbandCircuit(res, svcInfo);
          } else {
            if ( thisMain._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
              thisMain.logger.info(thisMain, '[ 개별청구회선 ]', thisMain._billpayInfo.paidAmtMonthSvcCnt);
              thisMain._typeChk = 'A4';
              thisMain.individualCircuit(res, svcInfo, allSvc, childInfo);
            } else {
              if ( thisMain._billpayInfo.repSvcYn === 'Y' ) {
                thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 ]', thisMain._billpayInfo.repSvcYn);
                thisMain._typeChk = 'A5';
                thisMain.combineRepresentCircuit(res, svcInfo, allSvc, childInfo);
              } else {
                thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
                thisMain._typeChk = 'A6';
                thisMain.combineCommonCircuit(res, svcInfo, allSvc, childInfo);
              }
            }
          }
          thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
          thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);

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
    // const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0030, {}), 'p3'); // 미납내역조회
    /*
    p1 = this._getPromiseApiMock(bill_guide_BFF_05_0036, 'p1');
    const p2 = this._getPromiseApiMock(bill_guide_BFF_05_0049, 'p2');
    const p3 = this._getPromiseApiMock(bill_guide_BFF_05_0024, 'p3');
    */

    Promise.all([p1, p2 /*, p3*/ ]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      // thisMain._unpaidBillsInfo = resArr[2].result;
      thisMain._childLineInfo = childInfo;

      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (!thisMain.reqQuery.line) ? thisMain.paidAmtSvcCdListFun() : null;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun(allSvc) : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;
      // thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';

      // thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();

      // 사용요금/청구요금이 존재하는지
      if ( thisMain.reqQuery.line ) {
        thisMain._billpayInfo.existBill = (thisMain._billpayInfo.useAmtDetailInfo && thisMain._billpayInfo.useAmtDetailInfo.length > 0);
      } else {
        thisMain._billpayInfo.existBill = (thisMain._billpayInfo.paidAmtDetailInfo && thisMain._billpayInfo.paidAmtDetailInfo.length > 0);
      }

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);

      thisMain.reqButtonView(res, thisMain._urlTplInfo.combineRepresentPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        showConditionInfo: thisMain._showConditionInfo,
        // unpaidBillsInfo: thisMain._unpaidBillsInfo,
        allSvc: allSvc
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      if ( err.code === 'BIL0076' ) {
        return res.render( 'billguide/myt-fare.bill.guide.nopay6month.html',
          { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      }

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

    Promise.all([p1, p2]).then(function(resArr) {
      // TODO: 사업자가 브로드밴드인 경우 이용요금을 조회하여 화면 노출 작업 필요 (SB 선행 작업 후)
      // if (thisMain._billpayInfo.coClCd === 'B') {
      //   thisMain._billpayInfo = Object.assign({
      //     coClCd: thisMain._billpayInfo.coClCd
      //   }, resArr[0].result);
      // }
      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;

      thisMain._childLineInfo = childInfo;

      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun(allSvc) : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineCommonPage] : ', thisMain._urlTplInfo.combineCommonPage);
      thisMain.reqButtonView(res, thisMain._urlTplInfo.combineCommonPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        allSvc: allSvc
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      if ( err.code === 'BIL0076' ) {
        return res.render( 'billguide/myt-fare.bill.guide.nopay6month.html',
          { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      }

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
    // const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0030, {}), 'p3'); // 미납내역조회

    Promise.all([p1, p2/*, p3*/]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      // thisMain._unpaidBillsInfo = resArr[2].result;
      thisMain._childLineInfo = childInfo;

      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun(allSvc) : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;
      // thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';
      // thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();

      thisMain.logger.info(thisMain, '[_urlTplInfo.individualPage] : ', thisMain._urlTplInfo.individualPage);
      thisMain.reqButtonView(res, thisMain._urlTplInfo.individualPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        showConditionInfo: thisMain._showConditionInfo,
        // unpaidBillsInfo: thisMain._unpaidBillsInfo,
        allSvc: allSvc
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      if ( err.code === 'BIL0076' ) {
        return res.render( 'billguide/myt-fare.bill.guide.nopay6month.html',
          { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      }

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

    Promise.all([p1]).then(function(resArr) {

      thisMain._ppsInfo = resArr[0].result;

      if ( thisMain._ppsInfo.dataYn === 'N' && thisMain._ppsInfo.dataOnlyYn === 'Y' ) { // 데이터 요금제 'A'
        thisMain._commDataInfo.ppsType = 'A';
      } else if ( thisMain._ppsInfo.dataYn === 'N' && thisMain._ppsInfo.dataOnlyYn === 'N' ) { // 음성 요금제 'B'
        thisMain._commDataInfo.ppsType = 'B';
      } else if ( thisMain._ppsInfo.dataYn === 'Y' && thisMain._ppsInfo.dataOnlyYn === 'N' ) { // 음성 + 데이터 요금제 'C'
        thisMain._commDataInfo.ppsType = 'C';
      }

      thisMain._commDataInfo.ppsProdAmt = FormatHelper.addComma( thisMain._ppsInfo.prodAmt );
      thisMain._commDataInfo.ppsRemained = FormatHelper.addComma( thisMain._ppsInfo.prodAmt );

      // thisMain._commDataInfo.ppsObEndDt = moment(thisMain._ppsInfo.obEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsObEndDt =
        DateHelper.getShortDateWithFormat(thisMain._ppsInfo.obEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsInbEndDt = moment(thisMain._ppsInfo.inbEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsInbEndDt =
        DateHelper.getShortDateWithFormat(thisMain._ppsInfo.inbEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsNumEndDt = moment(thisMain._ppsInfo.numEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsNumEndDt =
        DateHelper.getShortDateWithFormat(thisMain._ppsInfo.numEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsCurDate = thisMain.getCurDate();
      thisMain._commDataInfo.ppsCurDate = DateHelper.getCurrentDateTime('YYYY.M.DD hh:mm');

      thisMain._commDataInfo.ppsStartDateVal = thisMain.getStartDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsStartDateTxt = thisMain.getStartDateFormat('YYYY.M');

      thisMain._commDataInfo.ppsEndDateVal = thisMain.getEndDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsEndDateTxt = thisMain.getEndDateFormat('YYYY.M');

      thisMain.logger.info(thisMain, '[_urlTplInfo.prepaidPage] : ', thisMain._urlTplInfo.prepaidPage);
      thisMain.renderView(res, thisMain._urlTplInfo.prepaidPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        ppsInfo: thisMain._ppsInfo,
        commDataInfo: thisMain._commDataInfo,
        allSvc: allSvc
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
  private skbroadbandCircuit(res, svcInfo) {
    const thisMain = this;
    thisMain.renderView(res, thisMain._urlTplInfo.skbroadbandPage, {
      svcInfo: svcInfo,
      pageInfo: thisMain.pageInfo
    });
  }

  public reqButtonView(res: Response, view: string, data: any): any {
    const thisMain = this;
    const params = {
      startDt: DateHelper.getStartOfMonDate( String(this._billpayInfo.invDt), 'YYYYMMDD'),
      endDt: DateHelper.getEndOfMonDate( String(this._billpayInfo.invDt), 'YYYYMMDD')
    };
    data.roamDonaCallBtnYn = {
      roamingYn: 'N', donationYn: 'N', callgiftYn: 'N'
    };


    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0044, params),
      this.apiService.request(API_CMD.BFF_05_0038, params),
      this.apiService.request(API_CMD.BFF_05_0045, params)
    ).subscribe((resp) => {
      thisMain.logger.info(thisMain, resp);

      if ( resp[0].code === API_CODE.CODE_00 &&
        resp[0].result.roamingList && resp[0].result.roamingList.length > 0 ) {
        data.roamDonaCallBtnYn.roamingYn = 'Y';
      }

      if ( resp[1].code === API_CODE.CODE_00 &&
        resp[1].result.donationList && resp[1].result.donationList.length > 0 ) {
        data.roamDonaCallBtnYn.donationYn = 'Y';
      }

      if ( resp[2].code === API_CODE.CODE_00 &&
        resp[2].result.callData && Number(resp[2].result.callData) ) {
        data.roamDonaCallBtnYn.callgiftYn = 'Y';
      }
      thisMain.logger.info('===================== 로밍 YN : ' + data.roamDonaCallBtnYn.roamingYn);
      thisMain.logger.info('===================== 기부금 YN : ' + data.roamDonaCallBtnYn.donationYn);
      thisMain.logger.info('===================== 콜기프트 YN : ' + data.roamDonaCallBtnYn.callgiftYn);
      thisMain.logger.info(thisMain, '[ HTML ] : ', view);
      thisMain.renderView(res, view, data);
    });

  }

  // -------------------------------------------------------------[SVC]
  public getSelectNonPayment(): any {
    const thisMain = this;
    const unPaidAmtMonthInfoList = thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList;
    const queryDate = thisMain.reqQuery.date;

    if ( !unPaidAmtMonthInfoList || unPaidAmtMonthInfoList.length === 0 ) {
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

  // public getCurDate(): any {
  //   return moment().format('YYYY.MM.DD hh:mm');
  // }

  public getStartDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').startOf('month').format(formatStr);
    return DateHelper.getStartOfMonSubtractDate(undefined, '2', formatStr);
  }

  public getEndDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').endOf('month').format(formatStr);
    return DateHelper.getEndOfMonSubtractDate(undefined, '1', formatStr);
  }

  public getSelStaDt(date: string): any { // 월 시작일 구하기
    // return this._commDataInfo.selStaDt = moment(date).startOf('month').format('YYYY.MM.DD');
    return this._commDataInfo.selStaDt = DateHelper.getStartOfMonDate( date, 'YYYY.M.DD');
  }

  public getSelEndDt(date: string): any { // 월 끝나는 일 구하기
    // return this._commDataInfo.selEndDt = moment(date).endOf('month').format('MM.DD');
    return this._commDataInfo.selEndDt = DateHelper.getEndOfMonDate( date, 'YYYY.M.DD');
  }

  public getSelClaimDt(date: string): any { // 청구 년월 구하기
    // return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format( MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    return this._commDataInfo.selClaimDt =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
  }

  public getSelClaimDtM(date: string): any { // 청구 년월 구하기
    // return this._commDataInfo.selClaimDtM = moment(date).add(1, 'days').format('M');
    return this._commDataInfo.selClaimDtM =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', 'M' );
  }

  public intBillLineFun(allSvc: any) {
    const thisMain = this;

    const svcTotList = thisMain._intBillLineInfo || [];

    for ( let i = 0; i < svcTotList.length; i++ ) {
      const item = svcTotList[i];
      const svcItem = this.getAllSvcItem(allSvc, item.svcMgmtNum);
      item.addr = svcItem ? svcItem.addr : item.dtlAddr;

      if ( item.svcType === MYT_FARE_BILL_GUIDE.PHONE_SVCTYPE ) {
        item.label = thisMain.phoneStrToDash(item.svcNum);
      } else if (
        item.svcType.toLowerCase() === MYT_JOIN_WIRE_SVCATTRCD.M3.toLowerCase() ||
        item.svcType.toLowerCase() === MYT_JOIN_WIRE_SVCATTRCD.M4.toLowerCase() ||
        item.svcType === MYT_JOIN_WIRE_SVCATTRCD.S3 ) {

        item.label = thisMain.phoneStrToDash(svcItem ? svcItem.svcNum : item.svcNum);
      } else {

        item.label = item.addr;

      }
    }
    svcTotList.unshift({ svcType: MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE } );
    return svcTotList;
  }

  public getAllSvcItem(allSvc: any, svcMgmtNum: string) {
    if ( !allSvc ) {
      this.logger.error(this, 'allSvc is ' + allSvc);
      return null;
    }
    const listM = allSvc.m || [];
    const listS = allSvc.s || [];
    const listO = allSvc.o || [];
    const item =
      listM.find(svc => svc.svcMgmtNum === svcMgmtNum ) ||
      listS.find(svc => svc.svcMgmtNum === svcMgmtNum ) ||
      listO.find(svc => svc.svcMgmtNum === svcMgmtNum );
    return item;
  }

  public conditionChangeDtListFun() {

    const thisMain = this;
    const dtList = thisMain._billpayInfo.invDtArr ? thisMain._billpayInfo.invDtArr.slice() : [];
    for ( let i = 0; i < dtList.length; i++ ) {
      dtList[i] = DateHelper.getShortDateWithFormatAddByUnit(dtList[i], 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    }
    return dtList;
  }

  public paidAmtSvcCdListFun() {
    const thisMain = this;
    const paidAmtSvcCdList = thisMain._billpayInfo.paidAmtSvcCdList || [];
    for ( let i = 0; i < paidAmtSvcCdList.length; i++ ) {
      paidAmtSvcCdList[i].amt = FormatHelper.addComma(paidAmtSvcCdList[i].amt);
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
      }
    }
    return paidAmtSvcCdList;
  }


  // 별표가 있는 휴대폰 번호 대시 적용
  public phoneStrToDash(strCellphoneNum: string): string {
    if ( !strCellphoneNum ) {
      return '';
    }
    // return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
    return StringHelper.phoneStringToDash(strCellphoneNum.replace(/-/g, ''));
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
        // console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);

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
    data.allSvc = this.getAllSvcClone(data.allSvc);
    res.render(view, data);
  }


  /**
   * allSvc에서 필요한 정보만 복사
   * @param allSvc
   */
  private getAllSvcClone(allSvc: any) {
    if ( !allSvc ) {
      return null;
    }
    return {
      'm': this.copyArr(allSvc.m),
      's': this.copyArr(allSvc.s),
      'o': this.copyArr(allSvc.o)
    };
  }
  private copyArr(arr: Array<any>) {
    if ( !arr ) {
      return arr;
    }
    const tmpArr: Array<any> = [];
    for ( let i = 0 ; i < arr.length; i++ ) {
      tmpArr.push(this.copyObj(arr[i], ['svcMgmtNum', 'prodId', 'prodNm']));
    }
    return tmpArr;
  }
  private copyObj(obj: any, keys: Array<any>) {
    if ( !obj ) {
      return obj;
    }
    const tmp = {};
    for ( let i = 0; i < keys.length; i++) {
      if ( obj.hasOwnProperty(keys[i]) ) {
        tmp[keys[i]] = obj[keys[i]];
      }
    }
    return tmp;
  }

}

export default MyTFareBillGuide;
