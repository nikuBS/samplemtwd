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
  private _usedAmountsInfo: any; //사용요금 조회 BFF_05_0047

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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.reqQuery = req.query;

    let chargeRateReq: Observable<any>;
    if( this.reqQuery.invDt ) {
      chargeRateReq = this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt});//청구요금
    } else {
      chargeRateReq = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금
    }

    //const chargeRateReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금
    const myPlanReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});//나의요금제
    const childrenLineReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {});//자녀회선
    const nonPaymenthistoryReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0030, {});//미납내역
    const nonPaymenthistoryDayReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0031, {});//미납내역 납부가능일
    const nonPaymenthistorySetFreeReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});//미납요금 이용정지해제 정보 조회
    const usedAmountsReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0047, {});//사용요금 조회

    var thisMain = this;

    Observable.combineLatest(
      chargeRateReq,
      myPlanReq,
      childrenLineReq,
      nonPaymenthistoryReq,
      nonPaymenthistoryDayReq,
      nonPaymenthistorySetFreeReq,
      usedAmountsReq
    ).subscribe(
      {
        next( [
                chargeRateReq,
                myPlanReq,
                childrenLineReq,
                nonPaymenthistoryReq,
                nonPaymenthistoryDayReq,
                nonPaymenthistorySetFreeReq,
                usedAmountsReq
              ] ) {
          thisMain.logger.info(this, '[ 1. next > chargeRateReq ] 청구요금 : ', chargeRateReq);
          thisMain.logger.info(this, '[ 2. next > myPlanReq ] 나의요금제 : ', myPlanReq);
          thisMain.logger.info(this, '[ 3. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          thisMain.logger.info(this, '[ 4. next > nonPaymenthistoryReq ] 미납내역 : ', nonPaymenthistoryReq);
          thisMain.logger.info(this, '[ 5. next > nonPaymenthistoryDayReq ] 미납내역 납부가능일 : ', nonPaymenthistoryDayReq);
          thisMain.logger.info(this, '[ 6. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);

          thisMain._billpayInfo = (chargeRateReq.code==='00') ? chargeRateReq.result : null;//청구요금
          thisMain._baseFeePlansInfo = (myPlanReq.code==='00') ? myPlanReq.result : null;// 나의요금제
          thisMain._circuitChildInfo = (childrenLineReq.code==='00') ? childrenLineReq.result : null;//자녀회선
          thisMain._defaultInfo = (nonPaymenthistoryReq.code==='00') ? nonPaymenthistoryReq.result : null;//미납내역
          thisMain._paymentPossibleDayInfo = (nonPaymenthistoryDayReq.code==='00') ? nonPaymenthistoryDayReq.result : null;//미납내역 납부가능일
          thisMain._suspensionInfo = (nonPaymenthistorySetFreeReq.code==='00') ? nonPaymenthistorySetFreeReq.result : null;//미납요금 이용정지해제 정보 조회
          thisMain._usedAmountsInfo = (usedAmountsReq.code==='00') ? usedAmountsReq.result : null;//사용요금 조회
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.message || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          thisMain.controllerInit(res);
        } }
    );
  }//render end

  private controllerInit(res) {
    this.logger.info(this, '[ controllerInit ] : ');
    this._commDataInfo.selClaimDtNum = (this._billpayInfo) ? this.getSelClaimDtNum( String(this._billpayInfo.invDt) ) : null;
    this._commDataInfo.selClaimDtBtn = (this._billpayInfo) ? this.getSelClaimDtBtn( String(this._billpayInfo.invDt) ) : null;
    this._commDataInfo.selStaDt = (this._billpayInfo) ? this.getSelStaDt( String(this._billpayInfo.invDt) ) : null;

    this._commDataInfo.selEndDt = (this._billpayInfo) ? DateHelper.getShortDateNoDot( String(this._billpayInfo.invDt) ) : null;

    this._commDataInfo.discount = (this._billpayInfo) ? FormatHelper.addComma( String(Math.abs( Number(this._billpayInfo.deduckTotInvAmt))) ) : 0;

    this._commDataInfo.unPaidTotSum = (this._defaultInfo) ? FormatHelper.addComma( String(this._defaultInfo.unPaidTotSum) ) : null;

    // this._billpayInfo.paidAmtSvcCdList.map(item => {
    //   if ( item.svcNm === '이동전화' ) {
    //     item.svcNm = '휴대폰';
    //   }
    // });

    this._commDataInfo.joinSvcList = (this._billpayInfo) ? ( this._billpayInfo.paidAmtSvcCdList ) : null;
    this._commDataInfo.repSvcNm = (this._usedAmountsInfo) ? ( this._usedAmountsInfo.repSvcNm ) : null;

    this.getCircuitChildInfoMask( this._circuitChildInfo );

    this.setShowCondition();//노출조건 셋팅

    this.logger.info(this, '[할인금액] : ', this._commDataInfo.discount);
    this.logger.info(this, '[노출조건] : ', this._showConditionInfo);
    /*
    * 페이지 집입시 특정 조건에 따라 화면을 보여준다.
     */
    this.logger.info(this, '[_billpayInfo.coClCd] : ', this._billpayInfo.coClCd);
    this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] : ', this._billpayInfo.paidAmtMonthSvcCnt);
    this.logger.info(this, '[_circuitInfo.svcAttrCd] : ', this._svcInfo.svcAttrCd);
    this.logger.info(this, '[_billpayInfo.repSvcYn] : ', this._billpayInfo.repSvcYn);

    if( this._billpayInfo.coClCd === 'B') {
      this.logger.info(this, '[_circuitInfo.svcAttrCd] sk브로드 밴드(인터넷/IPTV/집전화) 화면출력 : ', this._svcInfo.svcAttrCd);
      this.skbroadbandCircuit(res);
    } else {

      if( this._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
        this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 개별청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);

        switch ( this._svcInfo.svcAttrCd ) {
          case 'O1' :
            this.logger.info(this, '[_circuitInfo.svcAttrCd] 기업솔루션(포인트캠) 화면출력 : ', this._svcInfo.svcAttrCd);
            this.companyCircuit(res);
            break;
          case 'M2' :
            this.logger.info(this, '[_circuitInfo.svcAttrCd] PPS(선불폰) 화면출력 : ', this._svcInfo.svcAttrCd);
            this.prepaidCircuit(res);
            break;
          default :
            this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 개별청구 화면출력 : ');
            this.individualCircuit(res);
        }
      }
      //else if( this._billpayInfo.paidAmtMonthSvcCnt > 1 ) {
      else {
        this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 통합청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);

        if( this._billpayInfo.repSvcYn === 'Y' ) {
          this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표 화면출력 : ', this._billpayInfo.repSvcYn);
          this.combineRepresentCircuit(res);
        }
        else {
          this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표아님 화면출력 : ', this._billpayInfo.repSvcYn);
          this.combineCommonCircuit(res);
        }
      }

    }
  }
  //-------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public setShowCondition() {//노출조건 정보 셋팅
    this._showConditionInfo.autopayYn = (this._billpayInfo.autopayYn === 'Y') ? 'Y' : 'N';
    this._showConditionInfo.childYn = (this._circuitChildInfo.length > 0) ? 'Y' : 'N';
    this._showConditionInfo.phoneYn = (this._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';
    // this._showConditionInfo.roamingYn = (this._roamingInfo.roamingList.length !== 0 ) ? 'Y' : 'N';
    // this._showConditionInfo.callGiftYn = (this._callGiftInfo.callData !== '0분 0초') ? 'Y' : 'N';
    // this._showConditionInfo.donationYn = (this._donationInfo.donationList.length !== 0) ? 'Y' : 'N';

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
    this.logger.info(this, '[_휴대폰 마스킹 처리 : ', obj);
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


  //-------------------------------------------------------------[서비스]
  //통합청구(대표)
  private combineRepresentCircuit(res) {
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

  public NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
  public fieldInfo = {
    lcl: 'billItmLclNm',
    scl: 'billItmSclNm',
    name: 'billItmNm',
    value: 'invAmt'
  };

  public arrayToObject(data: any, fieldInfo: any) {
    var amount = 0;
    var noVAT = false;
    var is3rdParty = false;
    var group = {};
    var DEFAULT_DESC_VISIBILITY = true;
    var groupInfoFields = this.NO_BILL_FIELDS;

    // data.forEach(function (item) {
    for(let item of data ){
      noVAT = false;
      is3rdParty = false;
      var groupL = item[fieldInfo.lcl];
      var groupS = item[fieldInfo.scl];

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

      // amount = Tw.StringHelper.parseCommaedStringToInt(item[fieldInfo.value]);
      group[groupL].total += amount;
      group[groupL][groupS].total += amount;

      var bill_item = {
        name: item[fieldInfo.name].replace(/[*#]/g, ''),
        // amount: Tw.StringHelper.commaSeparatedString(item[fieldInfo.value]),
        amount: item[fieldInfo.value],
        noVAT: item[fieldInfo.name].indexOf('*') > -1 ? true : false,
        is3rdParty: item[fieldInfo.name].indexOf('#') > -1 ? true : false,
        discount: amount < 0 ? true : false
      };
      // group[groupL][groupS].items.push($.extend({}, bill_item));
      group[groupL][groupS].items.push({ ...bill_item });
      bill_item.amount = item[fieldInfo.value];
    };

    //아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
    // $.each(group, function (key1, itemL) {
    Object.keys(group).forEach(key1 => {
      var itemL = group[key1];
      // $.each(itemL, function (key2, itemS) {
      Object.keys(itemL).forEach(key2 => {
        var itemS = itemL[key2];
        // if ( self.NO_BILL_FIELDS.indexOf(key2) < 0 ) {
        if ( groupInfoFields.indexOf(key2) < 0 ) {
          if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
            delete itemS.items[0];
          }
          itemS.discount = itemS.total < 0 ? true : false;
          // itemS.total = Tw.StringHelper.commaSeparatedString(itemS.total);
        }
        itemL.discount = itemL.total < 0 ? true : false;
        // itemL.total = Tw.StringHelper.commaSeparatedString(itemL.total);
      });
    });
    console.log(group);
    return group;
  }
}//MyTBillBillguide end

export default MyTBillBillguide;

