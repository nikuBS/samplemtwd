/**
 * FileName: myt.bill.feeguide.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.05
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';

class MyTBillBillguide extends TwViewController {
  constructor() {
    super();
  }

  private NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
  private fieldInfo = {
    lcl: 'billItmLclNm',
    scl: 'billItmSclNm',
    name: 'billItmNm',
    value: 'invAmt'
  };


  public reqQuery: any;  // 쿼리스트링
  private _svcInfo: any;
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036
  private _baseFeePlansInfo: any; // 나의요금제 | BFF_05_0041
  private _circuitChildInfo: any = []; // 자녀회선조회 | BFF_05_00024
  private _defaultInfo: any; // 미납내역 | BFF_05_0030
  private _paymentPossibleDayInfo: any; // 미납요금 납부가능일 조회 | BFF_05_0031
  private _suspensionInfo: any; // 미납요금 이용정지해제 정보 조회 | BFF_05_0037
  private _ppsInfoLookupInfo: any; // PPS 요금안내서 정보조회

  // 공통데이터
  private _commDataInfo: any = {
    selClaimDtBtn: '', // 선택 청구 월 | 2017년 10월
    selClaimDtNum: '', // 선택 청구 월 | number
    selStaDt: '', // 선택시작
    selEndDt: '', // 선택끝
    discount: '', // 할인액
    joinSvcList: '', // 가입 서비스 리스트
    unPaidTotSum: '', // 미납금액
    unPaidDetails: '', // 미납금액 상세내역
    prodNm: '', // pps 요금제
    prodAmt: '', // pps 잔액
    useEndDt: '', // pps 발신/사용기간
    dataKeepTrmDt: '', // pps 수신/데이터유지기간
    numKeepTrmDt: '', // pps 번유지기간
    curDt: '', // 현재날짜
    remained: '', // 잔여데이터 KB | 공백일 경우 표시안함
    dataYn: '', // 음성+데이터 'Y'
    dataProdYn: '', // MB 'Y' | 원 'N'
  };

  private _ppsInfo: any = {
    ppsPlan: null
  };

  // 노출조건
  private _showConditionInfo: any = {
    autopayYn: null, // 자동납부신청
    childYn: null, // 자녀회선
    phoneYn: null, // 선택회선이 휴대폰
    chargeTtYn: null, // 요금제: "T끼리 T내는 요금" prodId : "NA00001901"
    defaultYn: null, // 납부전
    paymentBtnYn: null, // 납부가능일 버튼
    suspensionYn: null // 이용정지해제 버튼
  };

  private _urlTplInfo: any = {
    combineRepresentPage: 'bill/myt.bill.billguide.combineRepresentPage.html', // 통합청구(대표)
    combineCommonPage: 'bill/myt.bill.billguide.combineCommonPage.html', // 통합청구(일반)
    individualPage: 'bill/myt.bill.billguide.individualPage.html', // 개별청구
    prepaidPage: 'bill/myt.bill.billguide.prepaidPage.html', // PPS(선불폰)
    companyPage: 'bill/myt.bill.billguide.companyPage.html', // 기업솔루션(포인트캠)
    skbroadbandPage: 'bill/myt.bill.billguide.skbroadbandPage.html' // sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;
    // ---------------------------------------------------------------------------------[화면 구분]
    /*
    * A1. 선불폰 | svcInfo.svcAttrCd : M2
    * A2. 기업솔루션 | svcInfo.svcAttrCd : O1
    * A3. SK브로드밴드 가입 | this._billpayInfo.coClCd | 'B' | 에러
    * A4. 개별청구회선 | this._billpayInfo.paidAmtMonthSvcCnt === 1
    * A5. 통합청구회선 대표 | this._billpayInfo.repSvcYn === 'Y'
    * A6. 통합청구회선 대표아님 | 에러
     */
    const chargeRateReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0036, {});

    switch ( this._svcInfo.svcAttrCd ) {
      case 'M2' :
        this.logger.info(this, '[ PPS(선불폰) ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'A1';
        break;
      case 'O1' :
        this.logger.info(this, '[ 기업솔루션(포인트캠) ]', this._svcInfo.svcAttrCd);
        this._typeChk = 'A2';
        break;
      default :
        const thisMain = this;

        if ( this._svcInfo.svcAttrCd !== 'M2' && this._svcInfo.svcAttrCd !== 'O1' ) {
          this.logger.info(this, '[ PPS, 기업솔루션이 아닌경우 ]');

          Observable.combineLatest(
            chargeRateReqApi
          ).subscribe(
            {
              next([chargeRateReq]) {
                if ( chargeRateReq.code === '00' ) {
                  thisMain.logger.info(this, '[ BFF_05_0036 ] : ', chargeRateReq);
                  thisMain.logger.info(this, '[ result.coClCd ] 회사구분 :', chargeRateReq.result.coClCd);
                  thisMain.logger.info(this, '[ result.repSvcYn ] 대표청구회선여부 : ', chargeRateReq.result.repSvcYn);
                  thisMain.logger.info(this, '[ result.paidAmtMonthSvcCnt ] 청구월회선수 :', chargeRateReq.result.paidAmtMonthSvcCnt);
                  thisMain.logger.info(this, '[ result.autopayYn ] 자동납부여부 :', chargeRateReq.result.autopayYn);
                  thisMain._billpayInfo = chargeRateReq.result;
                } else {
                  thisMain.logger.info(this, '[ ERROR ] : 회선 확인 필요! | 청구요금 조회 에러 BFF_05_0036');
                }
              },
              error(error) {
                thisMain.logger.info(this, '[ error > BFF_05_0036 ] : ', error.message || error);
              },
              complete() {
                thisMain.logger.info(this, '[ complete > BFF_05_0036] ');

                if ( thisMain._billpayInfo.coClCd === 'B' ) {
                  thisMain.logger.info(this, '[ SK브로드밴드 가입 ]', thisMain._billpayInfo.coClCd);
                  thisMain._typeChk = 'A3';
                } else {
                  if ( thisMain._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
                    thisMain.logger.info(this, '[ 개별청구회선 ]', thisMain._billpayInfo.paidAmtMonthSvcCnt);
                    thisMain._typeChk = 'A4';
                  } else {
                    if ( thisMain._billpayInfo.repSvcYn === 'Y' ) {
                      thisMain.logger.info(this, '[ 통합청구회선 > 대표 ]', thisMain._billpayInfo.repSvcYn);
                      thisMain._typeChk = 'A5';
                    } else {
                      thisMain.logger.info(this, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
                      thisMain._typeChk = 'A6';
                    }
                  }
                }
                thisMain.logger.info(this, '-------------------------------------[TEST END]');
                thisMain.logger.info(this, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
                thisMain.controllerInit(res);
              }
            }
          ); // subscribe end

        }
    }

    if ( this._typeChk === 'A1' || this._typeChk === 'A2' ) {
      this.logger.info(this, '[ PPS 선불폰, 기업솔루션 ]', this._typeChk);
      this.controllerInit(res);
    }
    // ---------------------------------------------------------------------------------[화면 구분 END]

  } // render end

  private controllerInit(res) {

    switch ( this._typeChk ) {
      case 'A1' :
        this.logger.info(this, '[ PPS 선불폰 controllerInit ] A1 : ', this._typeChk);
        this.prepaidCircuit(res);
        break;
      case 'A2' :
        this.logger.info(this, '[ 기업솔루션 controllerInit ] A2 : ', this._typeChk);
        this.companyCircuit(res);
        break;
      case 'A3' :
        this.logger.info(this, '[ SK브로드밴드 가입 controllerInit ] A3 : ', this._typeChk);
        this.skbroadbandCircuit(res);
        break;
      case 'A4' :
        this.logger.info(this, '[ 개별청구회선 controllerInit ] A4 : ', this._typeChk);
        this.individualCircuit(res);
        break;
      case 'A5' :
        this.logger.info(this, '[ 통합청구회선 대표 controllerInit ] A5 : ', this._typeChk);
        this.combineRepresentCircuit(res);
        break;
      case 'A6' :
        this.logger.info(this, '[ 통합청구회선 대표아님 controllerInit ] A6 : ', this._typeChk);
        this.combineCommonCircuit(res);
        break;
      default :

    }
  }

  // -------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public getSelStaDt(date: string): any { // 월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
  }

  public getSelClaimDtBtn(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('YYYY년 MM월');
  }

  public getSelClaimDtNum(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('M');
  }

  public getCircuitChildInfoMask(obj: any): any { // 휴대폰 마스킹 처리
    this.logger.info(this, '[_휴대폰 마스킹 처리 : ', obj.length);

    if ( obj.length !== 0 ) {
      this.logger.info(this, '[_휴대폰 마스킹 처리 2 : ');

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

  // -------------------------------------------------------------[서비스]
  // 통합청구(대표)
  private combineRepresentCircuit(res) {
    let chargeRateReqApi: Observable<any>;
    if ( this.reqQuery.invDt ) {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt });
    } else {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, {});
    }
    const myPlanReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {}); // 나의요금제
    const childrenLineReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {}); // 자녀회선
    const nonPaymenthistoryReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0030, {}); // 미납여부 버튼 노출
    const nonPaymenthistoryDayReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0031, {}); // 미납 납부가능일 선택버튼
    const nonPaymenthistorySetFreeReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});

    const thisMain = this;

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDtNum = (thisMain._billpayInfo) ? thisMain.getSelClaimDtNum(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtBtn = (thisMain._billpayInfo) ? thisMain.getSelClaimDtBtn(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? DateHelper.getShortDateNoDot(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (thisMain._billpayInfo) ? (thisMain._billpayInfo.paidAmtSvcCdList) : null;
      thisMain._commDataInfo.unPaidTotSum = (thisMain._defaultInfo) ? FormatHelper.addComma(String(thisMain._defaultInfo.unPaidTotSum)) : null;
      thisMain._commDataInfo.unPaidDetails = (thisMain._defaultInfo) ? thisMain._defaultInfo.unPaidAmtMonthInfoList : null;

      thisMain._commDataInfo.unPaidDetails.map((item) => {
        item.unPaidInvDt = moment(String(item.unPaidInvDt)).add(1, 'days').format('YYYY년 MM월');
        item.unPaidAmt = FormatHelper.addComma(String(item.unPaidAmt));
      });

      thisMain.logger.info(thisMain, '[ 미납요금 상세내역 ]', thisMain._commDataInfo.unPaidDetails);

      thisMain.getCircuitChildInfoMask(thisMain._circuitChildInfo);

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo.autopayYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.childYn = (thisMain._circuitChildInfo.length > 0) ? 'Y' : 'N';
      thisMain._showConditionInfo.phoneYn = (thisMain._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';
      if ( thisMain._defaultInfo ) {
        thisMain._showConditionInfo.defaultYn = (thisMain._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
      } else {
        thisMain._showConditionInfo.defaultYn = 'N';
      }
      thisMain._showConditionInfo.chargeTtYn = (thisMain._baseFeePlansInfo.prodId === 'NA00001901') ? 'Y' : 'N';
      thisMain._showConditionInfo.paymentBtnYn = (thisMain._paymentPossibleDayInfo.useObjYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.suspensionYn = (thisMain._suspensionInfo.useObjYn === 'Y') ? 'Y' : 'N';
    };

    Observable.combineLatest(
      chargeRateReqApi,
      myPlanReqApi,
      childrenLineReqApi,
      nonPaymenthistoryReqApi,
      nonPaymenthistoryDayReqApi,
      nonPaymenthistorySetFreeReqApi
    ).subscribe(
      {
        next([
               chargeRateReq,
               myPlanReq,
               childrenLineReq,
               nonPaymenthistoryReq,
               nonPaymenthistoryDayReq,
               nonPaymenthistorySetFreeReq
             ]) {
          thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
          thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);
          thisMain.logger.info(this, '[ 3. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          thisMain.logger.info(this, '[ 4. next > nonPaymenthistoryReq ] 미납내역 : ', nonPaymenthistoryReq);
          thisMain.logger.info(this, '[ 5. next > nonPaymenthistoryDayReq ] 미납내역 납부가능일 : ', nonPaymenthistoryDayReq);
          thisMain.logger.info(this, '[ 6. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);

          thisMain._billpayInfo = (chargeRateReq.code === '00') ? chargeRateReq.result : null;
          thisMain._baseFeePlansInfo = (myPlanReq.code === '00') ? myPlanReq.result : null;
          thisMain._circuitChildInfo = (childrenLineReq.code === '00') ? childrenLineReq.result : null;
          thisMain._defaultInfo = (nonPaymenthistoryReq.code === '00') ? nonPaymenthistoryReq.result : null;
          thisMain._paymentPossibleDayInfo = (nonPaymenthistoryDayReq.code === '00') ? nonPaymenthistoryDayReq.result : null;
          thisMain._suspensionInfo = (nonPaymenthistorySetFreeReq.code === '00') ? nonPaymenthistorySetFreeReq.result : null;
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          dataInit();
          thisMain.logger.info(this, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);
          thisMain.renderView(res, thisMain._urlTplInfo.combineRepresentPage, {
            reqQuery: thisMain.reqQuery,
            svcInfo: thisMain._svcInfo,
            billpayInfo: thisMain._billpayInfo,
            circuitChildInfo: thisMain._circuitChildInfo,
            commDataInfo: thisMain._commDataInfo,
            defaultInfo: thisMain._defaultInfo,
            showConditionInfo: thisMain._showConditionInfo,
            baseFeePlansInfo: thisMain._baseFeePlansInfo
          });

        }
      }
    );
  }

  // 통합청구(일반)
  private combineCommonCircuit(res) {

    let chargeRateReqApi: Observable<any>;
    if ( this.reqQuery.invDt ) {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0047, { invDt: this.reqQuery.invDt });
    } else {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0047, {});
    }
    const myPlanReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});

    const thisMain = this;

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDtNum = (thisMain._billpayInfo) ? thisMain.getSelClaimDtNum(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtBtn = (thisMain._billpayInfo) ? thisMain.getSelClaimDtBtn(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? DateHelper.getShortDateNoDot(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
    };

    Observable.combineLatest(
      chargeRateReqApi,
      myPlanReqApi,
    ).subscribe(
      {
        next([
               chargeRateReq,
               myPlanReq
             ]) {
          thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
          thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);

          thisMain._billpayInfo = (chargeRateReq.code === '00') ? chargeRateReq.result : null; // 청구요금
          thisMain._baseFeePlansInfo = (myPlanReq.code === '00') ? myPlanReq.result : null; // 나의요금제

        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          dataInit();
          thisMain.logger.info(this, '[_urlTplInfo.combineCommonPage] : ', thisMain._urlTplInfo.combineCommonPage);

          const billItems = thisMain.arrayToObject(thisMain._billpayInfo.useAmtDetailInfo, thisMain.fieldInfo);

          thisMain.renderView(res, thisMain._urlTplInfo.combineCommonPage, {
            reqQuery: thisMain.reqQuery,
            svcInfo: thisMain._svcInfo,
            billpayInfo: thisMain._billpayInfo,
            circuitChildInfo: thisMain._circuitChildInfo,
            commDataInfo: thisMain._commDataInfo,
            showConditionInfo: thisMain._showConditionInfo,
            baseFeePlansInfo: thisMain._baseFeePlansInfo,
            billItems: billItems
          });

        }
      }
    );

  }

  // 개별청구
  private individualCircuit(res) {
    let chargeRateReqApi: Observable<any>;
    if ( this.reqQuery.invDt ) {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt, detailYn: 'Y' });
    } else {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, { detailYn: 'Y' });
    }
    const myPlanReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});
    const childrenLineReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {});
    const nonPaymenthistoryReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0030, {});
    const nonPaymenthistoryDayReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0031, {});
    const nonPaymenthistorySetFreeReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});

    const thisMain = this;
    let billItems = {};

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDtNum = (thisMain._billpayInfo) ? thisMain.getSelClaimDtNum(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtBtn = (thisMain._billpayInfo) ? thisMain.getSelClaimDtBtn(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? DateHelper.getShortDateNoDot(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (thisMain._billpayInfo) ? (thisMain._billpayInfo.paidAmtSvcCdList) : null;
      thisMain._commDataInfo.unPaidTotSum = (thisMain._defaultInfo) ? FormatHelper.addComma(String(thisMain._defaultInfo.unPaidTotSum)) : null;
      thisMain._commDataInfo.unPaidDetails = (thisMain._defaultInfo) ? thisMain._defaultInfo.unPaidAmtMonthInfoList : null;

      thisMain._commDataInfo.unPaidDetails.map((item) => {
        item.unPaidInvDt = moment(String(item.unPaidInvDt)).add(1, 'days').format('YYYY년 MM월');
        item.unPaidAmt = FormatHelper.addComma(String(item.unPaidAmt));
      });

      thisMain.logger.info(thisMain, '[ 미납요금 상세내역 ]', thisMain._commDataInfo.unPaidDetails);

      thisMain.getCircuitChildInfoMask(thisMain._circuitChildInfo);

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo.autopayYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.childYn = (thisMain._circuitChildInfo.length > 0) ? 'Y' : 'N';
      thisMain._showConditionInfo.phoneYn = (thisMain._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';
      if ( thisMain._defaultInfo ) {
        thisMain._showConditionInfo.defaultYn = (thisMain._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
      } else {
        thisMain._showConditionInfo.defaultYn = 'N';
      }
      thisMain._showConditionInfo.chargeTtYn = (thisMain._baseFeePlansInfo.prodId === 'NA00001901') ? 'Y' : 'N';
      thisMain._showConditionInfo.paymentBtnYn = (thisMain._paymentPossibleDayInfo.useObjYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.suspensionYn = (thisMain._suspensionInfo.useObjYn === 'Y') ? 'Y' : 'N';
    };

    Observable.combineLatest(
      chargeRateReqApi,
      myPlanReqApi,
      childrenLineReqApi,
      nonPaymenthistoryReqApi,
      nonPaymenthistoryDayReqApi,
      nonPaymenthistorySetFreeReqApi
    ).subscribe(
      {
        next([
               chargeRateReq,
               myPlanReq,
               childrenLineReq,
               nonPaymenthistoryReq,
               nonPaymenthistoryDayReq,
               nonPaymenthistorySetFreeReq
             ]) {
          thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
          thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);
          thisMain.logger.info(this, '[ 3. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          thisMain.logger.info(this, '[ 4. next > nonPaymenthistoryReq ] 미납내역 : ', nonPaymenthistoryReq);
          thisMain.logger.info(this, '[ 5. next > nonPaymenthistoryDayReq ] 미납내역 납부가능일 : ', nonPaymenthistoryDayReq);
          thisMain.logger.info(this, '[ 6. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);

          thisMain._billpayInfo = (chargeRateReq.code === '00') ? chargeRateReq.result : null;
          thisMain._baseFeePlansInfo = (myPlanReq.code === '00') ? myPlanReq.result : null;
          thisMain._circuitChildInfo = (childrenLineReq.code === '00') ? childrenLineReq.result : null;
          thisMain._defaultInfo = (nonPaymenthistoryReq.code === '00') ? nonPaymenthistoryReq.result : null;
          thisMain._paymentPossibleDayInfo = (nonPaymenthistoryDayReq.code === '00') ? nonPaymenthistoryDayReq.result : null;
          thisMain._suspensionInfo = (nonPaymenthistorySetFreeReq.code === '00') ? nonPaymenthistorySetFreeReq.result : null;

          billItems = thisMain.arrayToObject(thisMain._billpayInfo.paidAmtDetailInfo, thisMain.fieldInfo);
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          dataInit();
          thisMain.logger.info(this, '[_urlTplInfo.individualPage] : ', thisMain._urlTplInfo.individualPage);
          thisMain.renderView(res, thisMain._urlTplInfo.individualPage, {
            reqQuery: thisMain.reqQuery,
            svcInfo: thisMain._svcInfo,
            billpayInfo: thisMain._billpayInfo,
            circuitChildInfo: thisMain._circuitChildInfo,
            commDataInfo: thisMain._commDataInfo,
            defaultInfo: thisMain._defaultInfo,
            showConditionInfo: thisMain._showConditionInfo,
            baseFeePlansInfo: thisMain._baseFeePlansInfo,
            billItems: billItems
          });

        }
      }
    );
  }

  // PPS(선불폰)
  private prepaidCircuit(res) {

    const ppsInfoLookupApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0013, {});
    const thisMain = this;
    const dataInit = function () {
      thisMain._commDataInfo.prodNm = (thisMain._ppsInfoLookupInfo) ? thisMain._ppsInfoLookupInfo.prodNm : null;
      thisMain._commDataInfo.prodAmt = (thisMain._ppsInfoLookupInfo) ? FormatHelper.addComma(String(thisMain._ppsInfoLookupInfo.prodAmt)) : null;
      thisMain._commDataInfo.useEndDt =
        (thisMain._ppsInfoLookupInfo) ? DateHelper.getShortDateWithFormat(String(thisMain._ppsInfoLookupInfo.useEndDt), 'YYYY.MM.DD') : null;
      thisMain._commDataInfo.dataKeepTrmDt =
        (thisMain._ppsInfoLookupInfo) ? DateHelper.getShortDateWithFormat(String(thisMain._ppsInfoLookupInfo.dataKeepTrmDt), 'YYYY.MM.DD') : null;
      thisMain._commDataInfo.numKeepTrmDt =
        (thisMain._ppsInfoLookupInfo) ? DateHelper.getShortDateWithFormat(String(thisMain._ppsInfoLookupInfo.numKeepTrmDt), 'YYYY.MM.DD') : null;
      thisMain._commDataInfo.curDt = moment().format('YYYY.MM.DD h:mm:ss');
      thisMain._commDataInfo.remained = (thisMain._ppsInfoLookupInfo) ? thisMain._ppsInfoLookupInfo.remained : null;
      thisMain._commDataInfo.dataYn = (thisMain._ppsInfoLookupInfo) ? thisMain._ppsInfoLookupInfo.dataYn : null;
      thisMain._commDataInfo.dataProdYn = (thisMain._ppsInfoLookupInfo) ? thisMain._ppsInfoLookupInfo.dataProdYn : null;

      /*
      * 데이터요금제 : _ppsInfoLookupInfo.dataProdYn 'Y'
      * 음성요금제 : _ppsInfoLookupInfo.dataProdYn 'N' && _ppsInfoLookupInfo.remained === ''
      * 음성+데이터 요금제 :  _ppsInfoLookupInfo.dataProdYn 'N' && _ppsInfoLookupInfo.remained === '데이터가 있을때'
       */
      thisMain._ppsInfo.ppsPlan = (function () {
        if ( thisMain._ppsInfoLookupInfo.dataProdYn === 'Y' ) {
          return 'dataPlan';
        } else {
          if ( thisMain._ppsInfoLookupInfo.remained === '' ) {
            return 'voicePlan';
          } else {
            return 'voiceDataPlan';
          }
        }
      })();
    };

    Observable.combineLatest(
      ppsInfoLookupApi
    ).subscribe(
      {
        next([ppsInfoLookup]) {

          thisMain.logger.info(this, '[ 1. next > ppsInfoLookup ] PPS 요금안내서 정보조회 : ', ppsInfoLookup);
          thisMain._ppsInfoLookupInfo = (ppsInfoLookup.code === '00') ? ppsInfoLookup.result : null;
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          dataInit();
          thisMain.logger.info(this, '[_urlTplInfo.prepaidPage] : ', thisMain._urlTplInfo.prepaidPage);
          thisMain.renderView(res, thisMain._urlTplInfo.prepaidPage, {
            reqQuery: thisMain.reqQuery,
            svcInfo: thisMain._svcInfo,
            ppsInfoLookupInfo: thisMain._ppsInfoLookupInfo,
            commDataInfo: thisMain._commDataInfo,
            ppsInfo: thisMain._ppsInfo
          });

        }
      }
    );

  }

  // 기업솔루션(포인트캠)
  private companyCircuit(res) {
    let chargeRateReqApi: Observable<any>;
    if ( this.reqQuery.invDt ) {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt, detailYn: 'Y' });
    } else {
      chargeRateReqApi = this.apiService.request(API_CMD.BFF_05_0036, { detailYn: 'Y' });
    }
    const myPlanReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});
    const childrenLineReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {});
    const nonPaymenthistoryReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0030, {});
    const nonPaymenthistoryDayReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0031, {});
    const nonPaymenthistorySetFreeReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});

    const thisMain = this;
    let billItems = {};

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDtNum = (thisMain._billpayInfo) ? thisMain.getSelClaimDtNum(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtBtn = (thisMain._billpayInfo) ? thisMain.getSelClaimDtBtn(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? DateHelper.getShortDateNoDot(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (thisMain._billpayInfo) ? (thisMain._billpayInfo.paidAmtSvcCdList) : null;
      thisMain._commDataInfo.unPaidTotSum = (thisMain._defaultInfo) ? FormatHelper.addComma(String(thisMain._defaultInfo.unPaidTotSum)) : null;
      thisMain._commDataInfo.unPaidDetails = (thisMain._defaultInfo) ? thisMain._defaultInfo.unPaidAmtMonthInfoList : null;

      thisMain._commDataInfo.unPaidDetails.map((item) => {
        item.unPaidInvDt = moment(String(item.unPaidInvDt)).add(1, 'days').format('YYYY년 MM월');
        item.unPaidAmt = FormatHelper.addComma(String(item.unPaidAmt));
      });

      thisMain.logger.info(thisMain, '[ 미납요금 상세내역 ]', thisMain._commDataInfo.unPaidDetails);

      thisMain.getCircuitChildInfoMask(thisMain._circuitChildInfo);

      thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo.autopayYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.childYn = (thisMain._circuitChildInfo.length > 0) ? 'Y' : 'N';
      thisMain._showConditionInfo.phoneYn = (thisMain._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';
      if ( thisMain._defaultInfo ) {
        thisMain._showConditionInfo.defaultYn = (thisMain._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
      } else {
        thisMain._showConditionInfo.defaultYn = 'N';
      }
      thisMain._showConditionInfo.chargeTtYn = (thisMain._baseFeePlansInfo.prodId === 'NA00001901') ? 'Y' : 'N';
      thisMain._showConditionInfo.paymentBtnYn = (thisMain._paymentPossibleDayInfo.useObjYn === 'Y') ? 'Y' : 'N';
      thisMain._showConditionInfo.suspensionYn = (thisMain._suspensionInfo.useObjYn === 'Y') ? 'Y' : 'N';
    };

    Observable.combineLatest(
      chargeRateReqApi,
      myPlanReqApi,
      childrenLineReqApi,
      nonPaymenthistoryReqApi,
      nonPaymenthistoryDayReqApi,
      nonPaymenthistorySetFreeReqApi
    ).subscribe(
      {
        next([
               chargeRateReq,
               myPlanReq,
               childrenLineReq,
               nonPaymenthistoryReq,
               nonPaymenthistoryDayReq,
               nonPaymenthistorySetFreeReq
             ]) {
          thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
          thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);
          thisMain.logger.info(this, '[ 3. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          thisMain.logger.info(this, '[ 4. next > nonPaymenthistoryReq ] 미납내역 : ', nonPaymenthistoryReq);
          thisMain.logger.info(this, '[ 5. next > nonPaymenthistoryDayReq ] 미납내역 납부가능일 : ', nonPaymenthistoryDayReq);
          thisMain.logger.info(this, '[ 6. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);

          thisMain._billpayInfo = (chargeRateReq.code === '00') ? chargeRateReq.result : null;
          thisMain._baseFeePlansInfo = (myPlanReq.code === '00') ? myPlanReq.result : null;
          thisMain._circuitChildInfo = (childrenLineReq.code === '00') ? childrenLineReq.result : null;
          thisMain._defaultInfo = (nonPaymenthistoryReq.code === '00') ? nonPaymenthistoryReq.result : null;
          thisMain._paymentPossibleDayInfo = (nonPaymenthistoryDayReq.code === '00') ? nonPaymenthistoryDayReq.result : null;
          thisMain._suspensionInfo = (nonPaymenthistorySetFreeReq.code === '00') ? nonPaymenthistorySetFreeReq.result : null;

          billItems = thisMain.arrayToObject(thisMain._billpayInfo.paidAmtDetailInfo, thisMain.fieldInfo);
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          dataInit();
          thisMain.logger.info(this, '[_urlTplInfo.companyPage] : ', thisMain._urlTplInfo.companyPage);
          thisMain.renderView(res, thisMain._urlTplInfo.companyPage, {
            reqQuery: thisMain.reqQuery,
            svcInfo: thisMain._svcInfo,
            billpayInfo: thisMain._billpayInfo,
            circuitChildInfo: thisMain._circuitChildInfo,
            commDataInfo: thisMain._commDataInfo,
            defaultInfo: thisMain._defaultInfo,
            showConditionInfo: thisMain._showConditionInfo,
            baseFeePlansInfo: thisMain._baseFeePlansInfo,
            billItems: billItems
          });

        }
      }
    );

  }


  // sk브로드밴드(인터넷/IPTV/집전화)
  private skbroadbandCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.skbroadbandPage] : ', this._urlTplInfo.skbroadbandPage);
    this.renderView(res, this._urlTplInfo.skbroadbandPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo: this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    });
  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }


  public arrayToObject(data: any, fieldInfo: any) {
    let amount;
    let noVAT;
    let is3rdParty;
    const group = {};
    const DEFAULT_DESC_VISIBILITY = true;
    const groupInfoFields = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];

    // data.forEach(function (item) {
    for ( const item of data ) {
      noVAT = false;
      is3rdParty = false;
      const groupL = item[fieldInfo.lcl];
      let groupS = item[fieldInfo.scl];

      if ( !group[groupL] ) {
        group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
        if ( groupL === '미납요금' ) {
          group[groupL].showDesc = false;
        }
      }

      if ( !group[groupL][groupS] ) {
        if ( groupS.indexOf('*') > -1 ) {
          groupS = groupS.replace(/\*/g, '');
          noVAT = true;
        } else if ( groupS.indexOf('#') > -1 ) {
          groupS = groupS.replace(/#/g, '');
          is3rdParty = true;
        }
        group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
      }

      amount = parseInt(item[fieldInfo.value].replace(/,/, ''), 10);
      group[groupL].total += amount;
      group[groupL][groupS].total += amount;

      const bill_item = {
        name: item[fieldInfo.name].replace(/[*#]/g, ''),
        amount: item[fieldInfo.value],
        noVAT: item[fieldInfo.name].indexOf('*') > -1 ? true : false,
        is3rdParty: item[fieldInfo.name].indexOf('#') > -1 ? true : false,
        discount: amount < 0 ? true : false
      };
      group[groupL][groupS].items.push({ ...bill_item });
      bill_item.amount = item[fieldInfo.value];
    }


    // 아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
    // $.each(group, function (key1, itemL) {
    Object.keys(group).forEach(key1 => {
      const itemL = group[key1];
      // $.each(itemL, function (key2, itemS) {
      Object.keys(itemL).forEach(key2 => {
        const itemS = itemL[key2];
        // if ( self.NO_BILL_FIELDS.indexOf(key2) < 0 ) {
        if ( groupInfoFields.indexOf(key2) < 0 ) {
          if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
            delete itemS.items[0];
          }
          itemS.discount = itemS.total < 0 ? true : false;
          itemS.total = itemS.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        itemL.discount = itemL.total < 0 ? true : false;
        itemL.total = itemL.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      });
    });
    console.log(group);
    return group;
  }
}

export default MyTBillBillguide;

