/**
 * MenuName: 나의 요금 > 요금안내서 통합(대표,일반)청구회선(MF_02_01)
 *           나의 요금 > 요금안내서 통합(일반)청구회선(MF_02_02)
 *           나의 요금 > 요금안내서 개별청구회선(MF_02_03)
 *           나의 요금 > 요금안내서 선불폰(PPS)(MF_02_04)
 *           나의 요금 > 요금안내서 > SK브로드밴드
 * FileName: myt-fare.bill.guide.controller.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 * Summary: 요금안내서 화면으로 진입 후 조건에 맞게 화면 분기 및 청구요금/사용요금 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
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
  private _useFeeInfo: any = {}; // 사용요금조회 | BFF_05_0047
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
    this.reqQuery.line = (this.reqQuery.line) ? this.reqQuery.line : '';
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';

    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);
    this.logger.info(this, '[ childInfo ] : ', childInfo);
    allSvc = allSvc || { 's': [], 'o': [], 'm': [] };

    if ( svcInfo.actCoClCd === 'B' ) {
      thisMain.logger.info(thisMain, '[ SK브로드밴드 가입 ]', svcInfo.actCoClCd);
      thisMain._typeChk = 'A3';
      // TODO: 사업자가 브로드밴드인 경우 이용요금을 조회하여 화면 노출 작업 필요 (SB 선행 작업 후)
      // thisMain.combineCommonCircuit(res, svcInfo, allSvc, childInfo);
      thisMain.skbroadbandCircuit(res, svcInfo);
      return;
    }

    // ---------------------------------------------------------------------------------[화면 구분]
    /*
    * A1. 선불폰 | svcInfo.svcAttrCd : M2
    * A2. 기업솔루션 | svcInfo.svcAttrCd : O1
    * A3. SK브로드밴드 가입 | this._billpayInfo.coClCd | 'B' | 에러
    * A4. 개별청구회선 | this._billpayInfo.paidAmtMonthSvcCnt === 1
    * A5. 통합청구회선 대표 | this._billpayInfo.repSvcYn === 'Y'
    * A6. 통합청구회선 대표아님 |
     */
    if ( svcInfo.svcAttrCd === 'M2' ) {

      this.logger.info(this, '[ PPS(선불폰) ] : ', svcInfo.svcAttrCd);
      this._typeChk = 'A1';
      thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
      thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
      this.prepaidCircuit(res, svcInfo, allSvc, childInfo, pageInfo);
      return ;

    } else if ( svcInfo.svcAttrCd === 'O1' ) {

      this.logger.info(this, '[ 기업솔루션(포인트캠) ]', svcInfo.svcAttrCd);
      this._typeChk = 'A2';
      thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
      thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
      this.companyCircuit(res, svcInfo, allSvc, childInfo);   // 화면없음
      return;

    }

    const reqArr: Array<any> = [];

    // 청구요금 조회 : 대표청구 여부(svcInfo.actRepYn) Y인 경우
    if ( svcInfo.actRepYn === 'Y' ) {
      reqArr.push(this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, {
        invDt: this.reqQuery.date,
        selSvcMgmtNum : this.reqQuery.line
      }, null, [], API_VERSION.V2), 'p1'));
      // reqArr.push(this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0049, {}), 'p2'));  // 성능개선으로 미호출

    } else {
    // 사용요금 조회 : 대표청구 여부(svcInfo.actRepYn) N인 경우
      reqArr.push((this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0047, {
        invDt: this.reqQuery.date,
        selSvcMgmtNum: this.reqQuery.line
      }, null, [], API_VERSION.V2), 'p11')));
    }

    // 자녀 회선 정보
    this._childLineInfo = childInfo;

    this.logger.info(this, '[ PPS, 기업솔루션이 아닌경우 ]');

    Promise.all(reqArr).then(function(resArr) {
      thisMain.logger.info(thisMain, `[ Promise.all > success ] : `, resArr);
      try {

        if ( svcInfo.actRepYn === 'Y' ) {
          // 청구 요금 데이터
          thisMain._billpayInfo = resArr[0].result;
          if ( thisMain._billpayInfo.invSvcList && thisMain._billpayInfo.invSvcList.length > 0) {
            // 청구 회선, 날짜 목록
            thisMain._intBillLineInfo = Object.assign([], resArr[0].result.invSvcList[0].svcList);
            thisMain._billpayInfo.invDtArr = thisMain._billpayInfo.invSvcList.map(item => item.invDt);
          }
          thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun(allSvc) : null;

        } else {
          thisMain._useFeeInfo = resArr[0].result.invAmtList;
          // 현재는 param이 없지만 추후 추가를 위해 넣어둠
          if ( resArr[0].result.invAmtList && resArr[0].result.invAmtList.length > 0) {
            // 사용 요금 데이터(조회한 날짜로 찾음)
            thisMain._billpayInfo = resArr[0].result.invAmtList.find(item => item.invDt === thisMain.reqQuery.date)
              || resArr[0].result.invAmtList[0];
            // 사용 날짜 목록
            thisMain._billpayInfo.invDtArr = resArr[0].result.invAmtList.map(item => item.invDt);
          }
          thisMain._commDataInfo.repSvcNm = FormatHelper.conTelFormatWithDash(resArr[0].result.repSvcNm);  // 통합청구대표 이름
          thisMain._commDataInfo.svcType = thisMain.getSvcType(thisMain._billpayInfo.usedAmountDetailList[0].svcNm);  // 서비스 타입(한글)
        }

        let viewName ;

        // 청구 시작, 종료일
        thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;

        // 총 요금, 할인요금
        thisMain._commDataInfo.useAmtTot = FormatHelper.addComma(thisMain._billpayInfo.totInvAmt.replace(/,/g, ''));
        thisMain._commDataInfo.discount =
            FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.dcAmt.replace(/,/g, '')))));

        // 청구 날짜 화면 출력 목록 (말일 날짜지만 청구는 다음달이기 때문에 화면에는 다음 월로 나와야함)
        thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

        const data = {
          reqQuery: thisMain.reqQuery,
          svcInfo: svcInfo,
          pageInfo: thisMain.pageInfo,
          billpayInfo: thisMain._billpayInfo,
          useFeeInfo: thisMain._useFeeInfo,
          commDataInfo: thisMain._commDataInfo,
          intBillLineInfo: thisMain._intBillLineInfo,
          childLineInfo: thisMain._childLineInfo,
          allSvc: allSvc
        };

        if ( svcInfo.actRepYn === 'N' ) {

          thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
          thisMain._typeChk = 'A6';

          // 사용요금/청구요금이 존재하는지
          thisMain._billpayInfo.existBill = (thisMain._billpayInfo.usedAmountDetailList && thisMain._billpayInfo.usedAmountDetailList.length > 0);

          viewName = thisMain._urlTplInfo.combineCommonPage;

        } else if ( svcInfo.actRepYn === 'Y' ) {

          // 조회일자에 맞는 서비스리스트
          const daySvcList = thisMain._billpayInfo.invSvcList.find(item => item.invDt === thisMain._billpayInfo.invDt) || {};


          // 개별청구 회선
          if ( daySvcList.svcList && daySvcList.svcList.length === 1 ) {

            thisMain.logger.info(thisMain, '[ 개별청구회선 ]', daySvcList.svcList.length);
            thisMain._typeChk = 'A4';

            // 요금납부버튼 무조건 노출로 삭제
            // thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;

            // thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';
            // thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();
            // data['showConditionInfo'] = thisMain._showConditionInfo;

            viewName = thisMain._urlTplInfo.individualPage;



          // 통합청구 회선
          } else {

            // 조회시 대표청구회선이거나 || 세션이 대표청구회선이면서 조회회선을 조회했을 경우
            if ( svcInfo.actRepYn === 'Y' || (svcInfo.actRepYn === 'Y' && thisMain.reqQuery.line) ) {
              thisMain.logger.info(thisMain, '[ 통합청구회선 > LINE:' + thisMain.reqQuery.line + ']', svcInfo.actRepYn);
              thisMain._typeChk = 'A5';

              thisMain._commDataInfo.joinSvcList = (!thisMain.reqQuery.line) ? thisMain.paidAmtSvcCdListFun() : null;

              // 요금납부버튼 무조건 노출로 삭제
              // thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;

              // thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';
              // thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();
              // data['showConditionInfo'] = thisMain._showConditionInfo;

              // 사용요금/청구요금이 존재하는지
              thisMain._billpayInfo.existBill = (thisMain._billpayInfo.paidAmtDetailList && thisMain._billpayInfo.paidAmtDetailList.length > 0);

              viewName = thisMain._urlTplInfo.combineRepresentPage;
            }
          }
        }

        thisMain.reqButtonView(res, viewName, data);

        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);

      } catch ( e )  {
        thisMain.logger.info(e);
      }
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);

      // 6개월간 청구요금 없음
      if ( err.code === 'BIL0076' ) {
        return res.render( 'billguide/myt-fare.bill.guide.nopay6month.html',
          { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      }

      // 회선이 query에 있어 오류가 나면 기본 페이지로 돌아간다.
      if ( thisMain.reqQuery.line ) {
        res.redirect('/myt-fare/billguide/guide');
      }

      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });

  }


  /**
   * PPS 선불폰
   */
  private prepaidCircuit(res, svcInfo, allSvc, childInfo, pageInfo) {
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
      thisMain._commDataInfo.ppsRemained = FormatHelper.addComma( thisMain._ppsInfo.remained );

      // thisMain._commDataInfo.ppsObEndDt = moment(thisMain._ppsInfo.obEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsObEndDt = DateHelper.getShortDate(thisMain._ppsInfo.obEndDt);
      // DateHelper.getShortDateWithFormat(thisMain._ppsInfo.obEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsInbEndDt = moment(thisMain._ppsInfo.inbEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsInbEndDt = DateHelper.getShortDate(thisMain._ppsInfo.inbEndDt);
      // DateHelper.getShortDateWithFormat(thisMain._ppsInfo.inbEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsNumEndDt = moment(thisMain._ppsInfo.numEndDt).format('YYYY.MM.DD');
      thisMain._commDataInfo.ppsNumEndDt = DateHelper.getShortDate(thisMain._ppsInfo.numEndDt);
      // DateHelper.getShortDateWithFormat(thisMain._ppsInfo.numEndDt, 'YYYY.M.DD', 'YYYYMMDD');

      // thisMain._commDataInfo.ppsCurDate = thisMain.getCurDate();
      thisMain._commDataInfo.ppsCurDate = DateHelper.getCurrentDateTime('YYYY.M.D. hh:mm');

      thisMain._commDataInfo.ppsStartDateVal = thisMain.getStartDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsStartDateTxt = thisMain.getStartDateFormat('YYYY.M.');

      thisMain._commDataInfo.ppsEndDateVal = thisMain.getEndDateFormat('YYYYMM');
      thisMain._commDataInfo.ppsEndDateTxt = thisMain.getEndDateFormat('YYYY.M.');

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
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });
  }
  // 기업솔루션
  private companyCircuit(res, svcInfo, allSvc, childInfo) {
    const thisMain = this;
  }

  /**
   * 대표청구회선이 SK브로드밴드인 경우
   */
  private skbroadbandCircuit(res, svcInfo) {
    const thisMain = this;
    thisMain.renderView(res, thisMain._urlTplInfo.skbroadbandPage, {
      svcInfo: svcInfo,
      pageInfo: thisMain.pageInfo
    });
  }

  /**
   * 로밍, 기부금, 콜기프트 버튼 보여질지 조회 후 화면 이동
   * 로밍(성능개선 항목으로 조회X)
   * @param res
   * @param view - 이동할 html
   * @param data - 청구/사용요금 조회데이터 등
   */
  public reqButtonView(res: Response, view: string, data: any): any {
    const thisMain = this;
    const params = {
      startDt: DateHelper.getStartOfMonDate( String(this._billpayInfo.invDt), 'YYYYMMDD'),
      endDt: DateHelper.getEndOfMonDate( String(this._billpayInfo.invDt), 'YYYYMMDD')
    };

    // 로밍api호출이 느려서 일단 무조건 노출함
    data.roamDonaCallBtnYn = {
      roamingYn: 'Y', donationYn: 'N', callgiftYn: 'N'
    };


    Observable.combineLatest(
      // this.apiService.request(API_CMD.BFF_05_0044, params),
      this.apiService.request(API_CMD.BFF_05_0038, params),
      this.apiService.request(API_CMD.BFF_05_0045, params)
    ).subscribe((resp) => {
      thisMain.logger.info(thisMain, resp);

      // 로밍api호출이 느려서 일단 무조건 노출함 2019.2.12

      // if ( resp[0].code === API_CODE.CODE_00 &&
      //   resp[0].result.roamingList && resp[0].result.roamingList.length > 0 ) {
      //   data.roamDonaCallBtnYn.roamingYn = 'Y';
      // }
      //
      // if ( resp[1].code === API_CODE.CODE_00 &&
      //   resp[1].result.donationList && resp[1].result.donationList.length > 0 ) {
      //   data.roamDonaCallBtnYn.donationYn = 'Y';
      // }
      //
      // if ( resp[2].code === API_CODE.CODE_00 &&
      //   resp[2].result.callData && Number(resp[2].result.callData) ) {
      //   data.roamDonaCallBtnYn.callgiftYn = 'Y';
      // }

      if ( resp[0].code === API_CODE.CODE_00 &&
        resp[0].result.donationList && resp[0].result.donationList.length > 0 ) {
        data.roamDonaCallBtnYn.donationYn = 'Y';
      }
      if ( resp[1].code === API_CODE.CODE_00 &&
        resp[1].result.callData && Number(resp[1].result.callData) ) {
        data.roamDonaCallBtnYn.callgiftYn = 'Y';
      }

      thisMain.logger.info( thisMain, '===================== 로밍 YN : ' + data.roamDonaCallBtnYn.roamingYn);
      thisMain.logger.info( thisMain, '===================== 기부금 YN : ' + data.roamDonaCallBtnYn.donationYn);
      thisMain.logger.info( thisMain, '===================== 콜기프트 YN : ' + data.roamDonaCallBtnYn.callgiftYn);

      thisMain.renderView(res, view, data);
    });

  }

  // -------------------------------------------------------------[SVC]
  // 사용안함 - 미납내역 확인
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
  // 당월 시작일
  public getStartDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').startOf('month').format(formatStr);
    return DateHelper.getStartOfMonSubtractDate(undefined, '2', formatStr);
  }
  // 당월 종료일
  public getEndDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').endOf('month').format(formatStr);
    return DateHelper.getEndOfMonSubtractDate(undefined, '1', formatStr);
  }
  // 월 시작일 구하기
  public getSelStaDt(date: string): any {
    // return this._commDataInfo.selStaDt = moment(date).startOf('month').format('YYYY.MM.DD');
    return this._commDataInfo.selStaDt = DateHelper.getStartOfMonDate( date, 'YYYY.M.D.');
  }
  // 월 끝나는 일 구하기
  public getSelEndDt(date: string): any {
    // return this._commDataInfo.selEndDt = moment(date).endOf('month').format('MM.DD');
    return this._commDataInfo.selEndDt = DateHelper.getEndOfMonDate( date, 'YYYY.M.D.');
  }
  // 청구 년월 구하기
  public getSelClaimDt(date: string): any {
    // return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format( MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    return this._commDataInfo.selClaimDt =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
  }
  // 청구 년월 구하기
  public getSelClaimDtM(date: string): any {
    // return this._commDataInfo.selClaimDtM = moment(date).add(1, 'days').format('M');
    return this._commDataInfo.selClaimDtM =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', 'M' );
  }

  /**
   * 회선정보 목록 리턴
   * @param allSvc
   * @return {svcType: '전체'} + 회선정보 목록
   */
  public intBillLineFun(allSvc: any) {
    const thisMain = this;

    const svcTotList = thisMain._intBillLineInfo || [];

    for ( let i = 0; i < svcTotList.length; i++ ) {
      const item = svcTotList[i];
      const svcItem = this.getAllSvcItem(allSvc, item.svcMgmtNum);

      item.svcType = this.getSvcType(item.name);
      item.label = item.name.substring(item.name.indexOf('(') + 1, item.name.indexOf(')') );

      if (item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M1 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M2 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M3 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M4 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.S3 ) {

        item.label = thisMain.phoneStrToDash(svcItem ? svcItem.svcNum : item.label);

      }
    }
    svcTotList.unshift({ svcType: MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE } );
    return svcTotList;
  }

  /**
   * 이름으로 svcType을 리턴
   * svcType = 휴대폰, 선불폰, T pocket Fi, T Login, T Wibro, 인터넷, IPTV, 집전화, 포인트캠
   * @param nm
   */
  private getSvcType(nm: String) {
    nm = nm.replace(/ /g, '').toLowerCase();

    // svcType
    if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M1) !== -1
      || nm.indexOf(MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) !== -1 ) {   // 이동전화
      return MYT_JOIN_WIRE_SVCATTRCD.M1;   // 휴대폰

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M2) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M2;      // 선불폰

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M3.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M3;      // T pocket Fi

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M4.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M4;      // T Login

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M5.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M5;      // T Wibro

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S1) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.S1;      // 인터넷

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S2.toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.S2;      // IPTV

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S3) !== -1
      || nm.indexOf(MYT_FARE_BILL_GUIDE.TEL_TYPE_1) !== -1 ) {
      return MYT_JOIN_WIRE_SVCATTRCD.S3;      // 집전화

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.O1) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.O1;      // 포인트캠

    }
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

  /**
   * 조회조건 날짜 목록을 리턴
   * 날짜는 모두 말일 -> +1일해서 다음 월로 리턴
   */
  public conditionChangeDtListFun() {

    const thisMain = this;
    const dtList = thisMain._billpayInfo.invDtArr ? thisMain._billpayInfo.invDtArr.slice() : [];
    for ( let i = 0; i < dtList.length; i++ ) {
      dtList[i] = DateHelper.getShortDateWithFormatAddByUnit(dtList[i], 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    }
    return dtList;
  }

  /**
   * 통합(대표)청구화면에서 (총 청구요금 하단) 회선,금액 목록 데이터를 금액:포맷팅, 서비스명:통일 해서 리턴
   */
  public paidAmtSvcCdListFun() {
    const thisMain = this;
    const paidAmtSvcCdList = thisMain._billpayInfo.paidAmtSvcCdList || [];
    for ( let i = 0; i < paidAmtSvcCdList.length; i++ ) {
      paidAmtSvcCdList[i].amt = FormatHelper.addComma(paidAmtSvcCdList[i].amt);
      // 이동전화 -> 휴대폰
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
      }
      // 유선전화 -> 집전화
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.TEL_TYPE_1) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.TEL_TYPE_0;
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

  // 안씀
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
