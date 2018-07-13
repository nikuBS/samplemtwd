/**
 * FileName: myt.bill.feeguide.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import Rx from 'rxjs/Rx';

import { API_CMD } from '../../../../types/api-command.type';
import { LINE_NAME, SVC_ATTR } from '../../../../types/bff-common.type';
import myTUsageData from '../../../../mock/server/myt.usage';
import DataLimit from '../../../../mock/server/myt.data-limit';
import billguide_BFF_01_0005 from '../../../../mock/server/myt.bill.billguide.BFF_01_0005';
import billguide_BFF_05_00036 from '../../../../mock/server/myt.bill.billguide.BFF_05_00036';
import billguide_BFF_05_00024 from '../../../../mock/server/myt.bill.billguide.BFF_05_00024';
import DateHelper from '../../../../utils/date.helper';
import moment = require('moment');
import { compile } from 'ejs';
import StringHelper from '../../../../utils/string.helper';
import FormatHelper from '../../../../utils/format.helper';
import billguide_BFF_05_00030 from '../../../../mock/server/myt.bill.billguide.BFF_05_00030';
import billguide_BFF_05_00038 from '../../../../mock/server/myt.bill.billguide.BFF_05_00038';
import billguide_BFF_05_00045 from '../../../../mock/server/myt.bill.billguide.BFF_05_00045';
import billguide_BFF_05_00044 from '../../../../mock/server/myt.bill.billguide.BFF_05_00044';
import billguide_BFF_05_00041 from '../../../../mock/server/myt.bill.billguide.BFF_05_00041';
import billguide_BFF_05_00031 from '../../../../mock/server/myt.bill.billguide.BFF_05_00031';
import billguide_BFF_05_00037 from '../../../../mock/server/myt.bill.billguide.BFF_05_00037';

class MyTBillBillguide extends TwViewController {

  private _svcInfo:any = {
    custNm: '',//고객명
    svcCd: '',//서비스구분코드
    svcNum: '',//서비스번
    svcNickNm: '',//회선닉네임
    repSvcYn: '',//대표회선여부
    svcCnt: '',//다회선수
  };
  //회선정보조회
  private _circuitInfo:any = {
    svcMgmtNum:'',//서비스관리번호
    svcGr:'',//서비스등급
    svcAttrCd:'M1',//서비스 속성
    repSvcYn:'',//기준회선여부
    svcNum:'',//서비스번호(마스킹)
    nickNm:'',//닉네임
    addr:''//주소
  };
  //청구요금조회
  private _billpayInfo: any = {};
  //자녀회선조회
  private _circuitChildInfo: any = [];
  //미납내역
  private _defaultInfo: any;

  //로밍 사용요금
  private _roamingInfo: any;
  //콜기프트 요금
  private _callGiftInfo: any;
  //기부금/후원금
  private _donationInfo: any;

  //나의요금제
  private _baseFeePlansInfo: any;

  //미납요금 납부가능일 조회 BFF_05_0031
  private _paymentPossibleDayInfo: any;

  //미납요금 이용정지해제 정보 조회 BFF_05_0037
  private _suspensionInfo: any;

  //공통데이터
  private _commDataInfo:any = {
    discount:'',//할인액
    selClaimDtNum:'',//선택 청구 월 | number
    selClaimDtBtn:'',//선택 청구 월 | 2017년 10월
    selStaDt:'',//선택시작
    selEndDt:'',//선택끝
    unPaidTotSum: '' //미납금액
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
    defaultYn: null, //미납여부
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

  constructor() {
    super();
  }

  //실행 : 데이터 가져오기
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let thisMain = this;
    this._svcInfo = svcInfo;

    //mock 데이터 테스트
    Rx.Observable.of([
      billguide_BFF_01_0005,
      billguide_BFF_05_00036,
      billguide_BFF_05_00024,
      billguide_BFF_05_00030,
      billguide_BFF_05_00044,
      billguide_BFF_05_00045,
      billguide_BFF_05_00038,
      billguide_BFF_05_00041,
      billguide_BFF_05_00031,
      billguide_BFF_05_00037

    ]).subscribe(
      {
        next(item) {
          thisMain.logger.info(this, '[ next > item ] : ', item);
          thisMain._circuitInfo = item[0].result;
          thisMain._billpayInfo = item[1].result;
          thisMain._circuitChildInfo = item[2].result;
          thisMain._defaultInfo = item[3].result;
          thisMain._roamingInfo = item[4].result;
          thisMain._callGiftInfo = item[5].result;
          thisMain._donationInfo = item[6].result;
          thisMain._baseFeePlansInfo = item[7].result;
          thisMain._paymentPossibleDayInfo = item[8].result;
          thisMain._suspensionInfo = item[9].result;

        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.stack || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          thisMain._commDataInfo.selClaimDtNum = thisMain.getSelClaimDtNum( String(thisMain._billpayInfo.invDt) );
          thisMain._commDataInfo.selClaimDtBtn = thisMain.getSelClaimDtBtn( String(thisMain._billpayInfo.invDt) );
          thisMain._commDataInfo.selStaDt = thisMain.getSelStaDt( String(thisMain._billpayInfo.invDt) );
          thisMain._commDataInfo.selEndDt = DateHelper.getShortDateNoDot( String(thisMain._billpayInfo.invDt) );
          thisMain._commDataInfo.discount = FormatHelper.addComma( String(Math.abs( Number(0))) );
          thisMain._commDataInfo.unPaidTotSum = FormatHelper.addComma( String(thisMain._defaultInfo.unPaidTotSum) );


          thisMain.setShowCondition();//노출조건 셋팅

          thisMain.controllerInit(res);
        }
      }
    );

    //BFF 데이터 사용시
    // Observable.combineLatest(
    //    this.getApiList()
    // ).subscribe((bffRestDataObj) => {
    //    this._bffDataObj = bffRestDataObj;
    //    this.controllerInit(res);
    // });
  }

  //컨트롤러 초기화 : 가져온 데이터를 활용해서 개발진행
  private controllerInit(res) {
    this.logger.info(this, '[할인금액] : ', this._commDataInfo.discount);
    this.logger.info(this, '[노출조건] : ', this._showConditionInfo);
    /*
    * 페이지 집입시 특정 조건에 따라 화면을 보여준다.
     */
    this.logger.info(this, '[_billpayInfo.coClCd] : ', this._billpayInfo.coClCd);
    this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] : ', this._billpayInfo.paidAmtMonthSvcCnt);
    this.logger.info(this, '[_circuitInfo.svcAttrCd] : ', this._circuitInfo.svcAttrCd);
    this.logger.info(this, '[_billpayInfo.repSvcYn] : ', this._billpayInfo.repSvcYn);

    if( this._billpayInfo.coClCd === 'B') {
      this.logger.info(this, '[_circuitInfo.svcAttrCd] sk브로드 밴드(인터넷/IPTV/집전화) 화면출력 : ', this._circuitInfo.svcAttrCd);
      this.skbroadbandCircuit(res);
    } else {

      if( this._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
        this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 개별청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);

        switch ( this._circuitInfo.svcAttrCd ) {
          case 'O1' :
            this.logger.info(this, '[_circuitInfo.svcAttrCd] 기업솔루션(포인트캠) 화면출력 : ', this._circuitInfo.svcAttrCd);
            this.companyCircuit(res);
            break;
          case 'M2' :
            this.logger.info(this, '[_circuitInfo.svcAttrCd] PPS(선불폰) 화면출력 : ', this._circuitInfo.svcAttrCd);
            this.prepaidCircuit(res);
            break;
          default :
            this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 개별청구 화면출력 : ');
            this.individualCircuit(res);
        }

      }
      else if( this._billpayInfo.paidAmtMonthSvcCnt > 1 ) {
        this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 통합청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);

        if( this._billpayInfo.repSvcYn === 'Y' ) {
          this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표 화면출력 : ', this._billpayInfo.repSvcYn);
          this.combineRepresentCircuit(res);
        }
        else if( this._billpayInfo.repSvcYn === 'N' ) {
          this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표아님 화면출력 : ', this._billpayInfo.repSvcYn);
          this.combineCommonCircuit(res);
        }
      }

    }
  }
  //-------------------------------------------------------------[서비스]
  //통합청구(대표)
  private combineRepresentCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.combineRepresentPage] : ', this._urlTplInfo.combineRepresentPage);
    this.renderView(res, this._urlTplInfo.combineRepresentPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }
  //통합청구(일반)
  private combineCommonCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.combineCommonPage] : ', this._urlTplInfo.combineCommonPage);
    this.renderView(res, this._urlTplInfo.combineCommonPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }
  //개별청구
  private individualCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.individualPage] : ', this._urlTplInfo.individualPage);
    this.renderView(res, this._urlTplInfo.individualPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }
  //PPS(선불폰)
  private prepaidCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.prepaidPage] : ', this._urlTplInfo.prepaidPage);
    this.renderView(res, this._urlTplInfo.prepaidPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }
  //기업솔루션(포인트캠)
  private companyCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.companyPage] : ', this._urlTplInfo.companyPage);
    this.renderView(res, this._urlTplInfo.companyPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }
  //sk브로드밴드(인터넷/IPTV/집전화)
  private skbroadbandCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.skbroadbandPage] : ', this._urlTplInfo.skbroadbandPage);
    this.renderView(res, this._urlTplInfo.skbroadbandPage, {
      svcInfo: this._svcInfo,
      circuitInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo: this._commDataInfo,
      defaultInfo: this._defaultInfo,
      showConditionInfo: this._showConditionInfo
    } );
  }

  //-------------------------------------------------------------[서비스 BFF 요청 모음]
  private BFF_05_0036(): any { return this.apiService.request(API_CMD.BFF_05_0036, {} ); } //청구요금조회
  private BFF_05_0041(): any { return this.apiService.request(API_CMD.BFF_05_0041, {} ); } //나의요금제
  private BFF_05_0030(): any { return this.apiService.request(API_CMD.BFF_05_0030, {} ); } //미납내역조회

  private BFF_05_0040(): any { return this.apiService.request(API_CMD.BFF_05_0040, {} ); } //무선 부가상품 가입여부
  private BFF_05_0024(): any { return this.apiService.request(API_CMD.BFF_05_0024, {} ); } //자녀회선조회
  private BFF_01_0005(): any { return this.apiService.request(API_CMD.BFF_01_0005, {} ); } //선택회선조회
  private BFF_05_0047(): any { return this.apiService.request(API_CMD.BFF_05_0047, {} ); } //사용요금조회(본인/자녀)

  private BFF_05_0044(): any { return this.apiService.request(API_CMD.BFF_05_0044, {} ); } //로밍 사용요금 상세조회
  private BFF_05_0045(): any { return this.apiService.request(API_CMD.BFF_05_0045, {} ); } //콜기프트 요금 상세조회
  private BFF_05_0038(): any { return this.apiService.request(API_CMD.BFF_05_0038, {} ); } //기부금/후원금 상세조회

  private BFF_05_0031(): any { return this.apiService.request(API_CMD.BFF_05_0031, {} ); } //미납요금 납부가능일 조회
  private BFF_05_0032(): any { return this.apiService.request(API_CMD.BFF_05_0032, {} ); } //미납요금 납부가능일 입력
  private BFF_05_0033(): any { return this.apiService.request(API_CMD.BFF_05_0033, {} ); } //미납요금 납부가능일 청구일정 조회
  private BFF_05_0034(): any { return this.apiService.request(API_CMD.BFF_05_0034, {} ); } //미납요금 이용정지해제
  private BFF_05_0037(): any { return this.apiService.request(API_CMD.BFF_05_0037, {} ); } //미납요금 이용정지해제 정보 조회

  private BFF_05_0013(): any { return this.apiService.request(API_CMD.BFF_05_0013, {} ); } //PPS 정보조회
  private BFF_05_0014(): any { return this.apiService.request(API_CMD.BFF_05_0014, {} ); } //PPS 사용내역 확인

  //-------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public getSelStaDt(date: string):any {//월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
  }
  public getSelClaimDtBtn(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('YYYY년 MM월');
  }
  public getSelClaimDtNum(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('M');
  }

  public setShowCondition():void {//노출조건 정보 셋팅
    this._showConditionInfo.autopayYn = this._billpayInfo.autopayYn;
    this._showConditionInfo.childYn = (this._circuitChildInfo.length > 0) ? 'Y' : 'N';
    this._showConditionInfo.phoneYn = (this._circuitInfo.svcAttrCd === 'M1') ? 'Y' : 'N';

    this._showConditionInfo.roamingYn = (this._roamingInfo.roamingList.length !== 0 ) ? 'Y' : 'N';
    this._showConditionInfo.callGiftYn = (this._callGiftInfo.callData !== '0분 0초') ? 'Y' : 'N';
    this._showConditionInfo.donationYn = (this._donationInfo.donationList.length !== 0) ? 'Y' : 'N';
    this._showConditionInfo.defaultYn = (this._defaultInfo.unPaidAmtMonthInfoList.length !== 0) ? 'Y' : 'N';
    this._showConditionInfo.chargeTtYn = (this._baseFeePlansInfo.prodId === 'NA00001901') ? 'Y' : 'N';

    this._showConditionInfo.paymentBtnYn = (this._paymentPossibleDayInfo.useObjYn === 'Y') ? 'Y' : 'N';
    this._showConditionInfo.suspensionYn = (this._suspensionInfo.useObjYn === 'Y') ? 'Y' : 'N';



  }



  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }




}

export default MyTBillBillguide;
