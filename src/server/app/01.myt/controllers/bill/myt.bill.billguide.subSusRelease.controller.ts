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
import * as _ from 'lodash';

class MyTBillBillguideSubSusRelease extends TwViewController {
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
    discount:'',//할인액
    selClaimDtNum:'',//선택 청구 월 | number
    selClaimDtBtn:'',//선택 청구 월 | 2017년 10월
    selStaDt:'',//선택시작
    selEndDt:'',//선택끝
    unPaidTotSum: '', //미납금액
    joinSvcList: '' //가입 서비스 리스트
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
    pageRenderView:  'bill/myt.bill.billguide.subSusRelease.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.reqQuery = req.query;

    //const chargeRateReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0036, {});//청구요금
    const nonPaymenthistorySetFreeReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0037, {});//미납요금 이용정지해제 정보 조회

    var thisMain = this;

    Observable.combineLatest(
      nonPaymenthistorySetFreeReq
    ).subscribe(
      {
        next( [
                nonPaymenthistorySetFreeReq
              ] ) {
          thisMain.logger.info(this, '[ 1. next > nonPaymenthistorySetFreeReq ] 미납요금 이용정지해제 정보 조회 : ', nonPaymenthistorySetFreeReq);
          thisMain._suspensionInfo = nonPaymenthistorySetFreeReq.result;//미납요금 이용정지해제 정보 조회
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.stack || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          thisMain.controllerInit(res);
        } }
    );

  }//render end

  private controllerInit(res) {

    this.pageRenderView(res);

  }
  //-------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public setShowCondition():void {//노출조건 정보 셋팅
    this._showConditionInfo.autopayYn = this._billpayInfo.autopayYn;
    this._showConditionInfo.childYn = (this._circuitChildInfo.length > 0) ? 'Y' : 'N';
    this._showConditionInfo.phoneYn = (this._svcInfo.svcAttrCd === 'M1') ? 'Y' : 'N';

    // this._showConditionInfo.roamingYn = (this._roamingInfo.roamingList.length !== 0 ) ? 'Y' : 'N';
    // this._showConditionInfo.callGiftYn = (this._callGiftInfo.callData !== '0분 0초') ? 'Y' : 'N';
    // this._showConditionInfo.donationYn = (this._donationInfo.donationList.length !== 0) ? 'Y' : 'N';

    this._showConditionInfo.defaultYn = (this._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
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
  private pageRenderView(res) {
    this.logger.info(this, '[_urlTplInfo.pageRenderView] : ', this._urlTplInfo.pageRenderView);
    this.renderView(res, this._urlTplInfo.pageRenderView, {
      reqQuery: this.reqQuery,
      svcInfo: this._svcInfo,
      suspensionInfo : this._suspensionInfo
    } );
  }

  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }


}

export default MyTBillBillguideSubSusRelease;

