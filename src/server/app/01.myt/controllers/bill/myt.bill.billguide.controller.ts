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
  public reqQuery:any;//쿼리스트링
  private _svcInfo:any;
  private _billpayInfo: any = {}; //청구요금조회 BFF_05_0036
  private _circuitChildInfo: any = []; //자녀회선조회 BFF_05_00024
  private _defaultInfo: any; //미납내역 BFF_05_0030
  private _baseFeePlansInfo: any; //나의요금제 BFF_05_0041
  private _paymentPossibleDayInfo: any; //미납요금 납부가능일 조회 BFF_05_0031
  private _suspensionInfo: any; //미납요금 이용정지해제 정보 조회 BFF_05_0037

  //공통데이터
  private _commDataInfo:any = {
    selClaimDtBtn:'',//선택 청구 월 | 2017년 10월
    selClaimDtNum:'',//선택 청구 월 | number
    selStaDt:'',//선택시작
    selEndDt:'',//선택끝
    discount:'',//할인액
    joinSvcList: '', //가입 서비스 리스트
    unPaidTotSum: '', //미납금액
  };

  //노출조건
  private _showConditionInfo:any = {
    autopayYn: null, //자동납부신청
    childYn: null, //자녀회선
    phoneYn: null, //선택회선이 휴대폰
    roamingYn: null, //로밍
    callGiftYn: null, //콜기프트
    donationYn: null, //기부금/후원금
    chargeTtYn: null, //요금제: "T끼리 T내는 요금" prodId : "NA00001901"
    defaultYn: null, //납부전
    paymentBtnYn: null, //납부가능일 버튼
    suspensionYn: null //이용정지해제 버튼
  };

  private _urlTplInfo:any = {
    combineRepresentPage:  'bill/myt.bill.billguide.combineRepresentPage.html',//통합청구(대표)
    combineCommonPage:     'bill/myt.bill.billguide.combineCommonPage.html',//통합청구(일반)
    individualPage:        'bill/myt.bill.billguide.individualPage.html',//개별청구
    prepaidPage:           'bill/myt.bill.billguide.prepaidPage.html',//PPS(선불폰)
    companyPage:           'bill/myt.bill.billguide.companyPage.html',//기업솔루션(포인트캠)
    skbroadbandPage:       'bill/myt.bill.billguide.skbroadbandPage.html'//sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _typeChk:any = null; //화면구분

  public rxObs:any = {
    chargeRateReq: null,
    myPlanReq: null,
    childrenLineReq: null,
    nonPaymenthistoryReq: null,
    nonPaymenthistoryDayReq: null,
    nonPaymenthistorySetFreeReq: null
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;
    //---------------------------------------------------------------------------------[화면 구분]
    /*
    * A1. 선불폰 | svcInfo.svcAttrCd : M2
    * A2. 기업솔루션 | svcInfo.svcAttrCd : O1
    * A3. SK브로드밴드 가입 | this._billpayInfo.coClCd | 'B' | 에러
    * A4. 개별청구회선 | this._billpayInfo.paidAmtMonthSvcCnt === 1
    * A5. 통합청구회선 대표 | this._billpayInfo.repSvcYn === 'Y'
    * A6. 통합청구회선 대표아님 | 에러
     */
    const chargeRateReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금

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
          var thisMain = this;

          Observable.combineLatest(
            chargeRateReq
          ).subscribe(
            {
              next( [chargeRateReq] ) {
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

                if ( thisMain._billpayInfo.coClCd === 'B') {
                  thisMain.logger.info(this, '[ SK브로드밴드 가입 ]', thisMain._billpayInfo.coClCd);
                  thisMain._typeChk = 'A3';
                }
                else {
                  if( thisMain._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
                    thisMain.logger.info(this, '[ 개별청구회선 ]', thisMain._billpayInfo.paidAmtMonthSvcCnt);
                    thisMain._typeChk = 'A4';
                  }
                  else {
                    if ( thisMain._billpayInfo.repSvcYn === 'Y') {
                      thisMain.logger.info(this, '[ 통합청구회선 > 대표 ]', thisMain._billpayInfo.repSvcYn);
                      thisMain._typeChk = 'A5';
                    }
                    else {
                      thisMain.logger.info(this, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
                      thisMain._typeChk = 'A6';
                    }
                  }
                }
                thisMain.logger.info(this, '-------------------------------------[TEST END]');
                thisMain.logger.info(this, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
                //thisMain.controllerInit(res);
              }}
          );//subscribe end

    }
    //---------------------------------------------------------------------------------[화면 구분 END]
    //
    // let chargeRateReq: Observable<any>;
    // if( this.reqQuery.invDt ) {
    //   chargeRateReq = this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt});//청구요금
    // } else {
    //   chargeRateReq = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금
    // }
    //
    // //const chargeRateReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금
    // const myPlanReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});//나의요금제
    // const childrenLineReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {});//자녀회선
    // const nonPaymenthistoryReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0030, {});//미납내역
    // const nonPaymenthistoryDayReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0031, {});//미납내역 납부가능일
    // const nonPaymenthistorySetFreeReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});//미납요금 이용정지해제 정보 조회
    //
    // var thisMain = this;
    //
    // Observable.combineLatest(
    //   chargeRateReq,
    //   myPlanReq,
    //   childrenLineReq,
    //   nonPaymenthistoryReq,
    //   nonPaymenthistoryDayReq,
    //   nonPaymenthistorySetFreeReq
    // ).subscribe(
    //   {
    //     next( [
    //             chargeRateReq,
    //             myPlanReq,
    //             childrenLineReq,
    //             nonPaymenthistoryReq,
    //             nonPaymenthistoryDayReq,
    //             nonPaymenthistorySetFreeReq
    //           ] ) {
    //       thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
    //       thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);
    //       thisMain.logger.info(this, '[ 3. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
    //       thisMain.logger.info(this, '[ 4. next > nonPaymenthistoryReq ] 미납내역 : ', nonPaymenthistoryReq);
    //       thisMain.logger.info(this, '[ 5. next > nonPaymenthistoryDayReq ] 미납내역 납부가능일 : ', nonPaymenthistoryDayReq);
    //       thisMain.logger.info(this, '[ 6. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);
    //
    //       thisMain._billpayInfo = (chargeRateReq.code==='00') ? chargeRateReq.result : null;//청구요금
    //       thisMain._baseFeePlansInfo = (myPlanReq.code==='00') ? myPlanReq.result : null;// 나의요금제
    //       thisMain._circuitChildInfo = (childrenLineReq.code==='00') ? childrenLineReq.result : null;//자녀회선
    //       thisMain._defaultInfo = (nonPaymenthistoryReq.code==='00') ? nonPaymenthistoryReq.result : null;//미납내역
    //       thisMain._paymentPossibleDayInfo = (nonPaymenthistoryDayReq.code==='00') ? nonPaymenthistoryDayReq.result : null;//미납내역 납부가능일
    //       thisMain._suspensionInfo = (nonPaymenthistorySetFreeReq.code==='00') ? nonPaymenthistorySetFreeReq.result : null;//미납요금 이용정지해제 정보 조회
    //     },
    //     error(error) {
    //       thisMain.logger.info(this, '[ error ] : ', error.message || error);
    //     },
    //     complete() {
    //       thisMain.logger.info(this, '[ complete ] : ');
    //       thisMain.controllerInit(res);
    //     } }
    // );

  }//render end

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
    // this.logger.info(this, '[ controllerInit ] : ');
    // this._commDataInfo.selClaimDtNum = (this._billpayInfo) ? this.getSelClaimDtNum( String(this._billpayInfo.invDt) ) : null;
    // this._commDataInfo.selClaimDtBtn = (this._billpayInfo) ? this.getSelClaimDtBtn( String(this._billpayInfo.invDt) ) : null;
    // this._commDataInfo.selStaDt = (this._billpayInfo) ? this.getSelStaDt( String(this._billpayInfo.invDt) ) : null;
    //
    // this._commDataInfo.selEndDt = (this._billpayInfo) ? DateHelper.getShortDateNoDot( String(this._billpayInfo.invDt) ) : null;
    //
    // this._commDataInfo.discount = (this._billpayInfo) ? FormatHelper.addComma( String(Math.abs( Number(this._billpayInfo.deduckTotInvAmt))) ) : 0;
    //
    // this._commDataInfo.unPaidTotSum = (this._defaultInfo) ? FormatHelper.addComma( String(this._defaultInfo.unPaidTotSum) ) : null;
    //
    // this._commDataInfo.joinSvcList = (this._billpayInfo) ? ( this._billpayInfo.paidAmtSvcCdList ) : null;
    //
    // this.getCircuitChildInfoMask( this._circuitChildInfo );
    //
    // this.setShowCondition();//노출조건 셋팅
  }
  //-------------------------------------------------------------[데이터 가공]
  private resDataInit() {

  }

  //-------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public setShowCondition() {//노출조건 정보 셋팅
    this._showConditionInfo.autopayYn = (this._billpayInfo.autopayYn === 'Y') ? 'Y' : 'N';
    this._showConditionInfo.childYn = (this._circuitChildInfo.length > 0) ? 'Y' : 'N';
    this._showConditionInfo.phoneYn = (this._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';

    if(this._defaultInfo) {
      this._showConditionInfo.defaultYn = (this._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
    } else {
      this._showConditionInfo.defaultYn = 'N';
    }

    this._showConditionInfo.chargeTtYn = (this._baseFeePlansInfo.prodId === 'NA00001901') ? 'Y' : 'N';
    this._showConditionInfo.paymentBtnYn = (this._paymentPossibleDayInfo.useObjYn === 'Y') ? 'Y' : 'N';
    this._showConditionInfo.suspensionYn = (this._suspensionInfo.useObjYn === 'Y') ? 'Y' : 'N';
  }

  public getSelStaDt(date: string):any {//월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
  }
  public getSelClaimDtBtn(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('YYYY년 MM월');
  }
  public getSelClaimDtNum(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('M');
  }

  public getCircuitChildInfoMask(obj: any):any { //휴대폰 마스킹 처리
    this.logger.info(this, '[_휴대폰 마스킹 처리 : ', obj.length);

    if ( obj.length !==  0 ) {
      this.logger.info(this, '[_휴대폰 마스킹 처리 2 : ');

      this._commDataInfo.subChildBillInfo = obj.map( item => {

        let phoneNum_0 = item.svcNum.substr(0, 3) ;
        let phoneNum_1 = item.svcNum.substr(3, 4) ;
        let phoneNum_2 = item.svcNum.substr(7, 4) ;

        phoneNum_0 = StringHelper.masking(phoneNum_0, '*', 0);
        phoneNum_1 = StringHelper.masking(phoneNum_1, '*', 2);
        phoneNum_2 = StringHelper.masking(phoneNum_2, '*', 2);

        return item.svcNum = phoneNum_0 + '-' + phoneNum_1 + '-' + phoneNum_2;

      });
    }
  }

  //-------------------------------------------------------------[서비스]
  //통합청구(대표)
  private combineRepresentCircuit(res) {
    //this.rxObs.

    Observable.combineLatest(
      this.rxObs.myPlanReq
    );


    this.logger.info(this, '[_urlTplInfo.combineRepresentPage] : ', this._urlTplInfo.combineRepresentPage);
    this.renderView(res, this._urlTplInfo.combineRepresentPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }
  //통합청구(일반)
  private combineCommonCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.combineCommonPage] : ', this._urlTplInfo.combineCommonPage);
    this.renderView(res, this._urlTplInfo.combineCommonPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }
  //개별청구
  private individualCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.individualPage] : ', this._urlTplInfo.individualPage);
    this.renderView(res, this._urlTplInfo.individualPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }
  //PPS(선불폰)
  private prepaidCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.prepaidPage] : ', this._urlTplInfo.prepaidPage);
    this.renderView(res, this._urlTplInfo.prepaidPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }
  //기업솔루션(포인트캠)
  private companyCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.companyPage] : ', this._urlTplInfo.companyPage);
    this.renderView(res, this._urlTplInfo.companyPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }
  //sk브로드밴드(인터넷/IPTV/집전화)
  private skbroadbandCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.skbroadbandPage] : ', this._urlTplInfo.skbroadbandPage);
    this.renderView(res, this._urlTplInfo.skbroadbandPage, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo,
      baseFeePlansInfo: this._baseFeePlansInfo
    } );
  }

  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }


}//MyTBillBillguide end

export default MyTBillBillguide;

