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
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036
  private _useFeeInfo: any = {}; // 사용요금조회 | BFF_05_0047
  private _intBillLineInfo: any = {}; // 통합청구등록회선조회 | BFF_05_0049
  private _childLineInfo: any = {}; // 자녀회선 조회 | BFF_05_0024
  private _ppsInfoLookupInfo: any; // PPS 요금안내서 정보조회

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
    combineRepresentPage: 'bill/myt-fare.bill.guide.integrated-rep.html', // 통합청구(대표)
    combineCommonPage: 'bill/myt-fare.bill.guide.integrated-normal.html', // 통합청구(일반)
    individualPage: 'bill/myt-fare.bill.guide.individual.html', // 개별청구
    prepaidPage: 'bill/myt-fare.bill.guide.pps.html', // PPS(선불폰)
    companyPage: 'bill/myt-fare.bill.guide.solution.html', // 기업솔루션(포인트캠)
    skbroadbandPage: 'bill/myt-fare.bill.guide.skbd.html' // sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
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
        thisMain.controllerInit(res, svcInfo);
        break;
      case 'O1' :
        this.logger.info(this, '[ 기업솔루션(포인트캠) ]', svcInfo.svcAttrCd);
        this._typeChk = 'A2';
        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);
        thisMain.controllerInit(res, svcInfo);
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

            thisMain.controllerInit(res, svcInfo);

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
  private controllerInit(res, svcInfo) {

    switch ( this._typeChk ) {
      case 'A1' :
        this.logger.info(this, '[ PPS 선불폰 controllerInit ] A1 : ', this._typeChk);
        this.prepaidCircuit(res, svcInfo);
        break;
      case 'A2' :
        this.logger.info(this, '[ 기업솔루션 controllerInit ] A2 : ', this._typeChk);
        this.companyCircuit(res, svcInfo);
        break;
      case 'A3' :
        this.logger.info(this, '[ SK브로드밴드 가입 controllerInit ] A3 : ', this._typeChk);
        this.skbroadbandCircuit(res, svcInfo);
        break;
      case 'A4' :
        this.logger.info(this, '[ 개별청구회선 controllerInit ] A4 : ', this._typeChk);
        this.individualCircuit(res, svcInfo);
        break;
      case 'A5' :
        this.logger.info(this, '[ 통합청구회선-대표 controllerInit ] A5 : ', this._typeChk);
        this.combineRepresentCircuit(res, svcInfo);
        break;
      case 'A6' :
        this.logger.info(this, '[ 통합청구회선-일반 controllerInit ] A6 : ', this._typeChk);
        this.combineCommonCircuit(res, svcInfo);
        break;
      default :

    }
  }

  // 통합청구(대표)
  private combineRepresentCircuit(res, svcInfo) {
    const thisMain = this;
    let p1;
    /*
    * 실 데이터
    */
    if ( this.reqQuery.invDt ) {
      p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, { invDt: this.reqQuery.invDt }), 'p1');
    } else {
      p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0036, {}), 'p1');
    }
    const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0049, {}), 'p2'); // 통합청구등록회선조회
    const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0024, {}), 'p3'); // 자녀회선조회

    /*
    p1 = this._getPromiseApiMock(bill_guide_BFF_05_0036, 'p1');
    const p2 = this._getPromiseApiMock(bill_guide_BFF_05_0049, 'p2');
    const p3 = this._getPromiseApiMock(bill_guide_BFF_05_0024, 'p3');
    */

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? DateHelper.getShortDateNoDot(String(thisMain._billpayInfo.invDt)) : null;
      thisMain._commDataInfo.discount =
        (thisMain._billpayInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt)))) : 0;
      thisMain._commDataInfo.joinSvcList = (thisMain._billpayInfo) ? (thisMain._billpayInfo.paidAmtSvcCdList) : null;
      thisMain._commDataInfo.useAmtTot = (thisMain._billpayInfo) ? FormatHelper.addComma(thisMain._billpayInfo.useAmtTot) : null;

      thisMain._commDataInfo.intBillLineList = (thisMain._intBillLineInfo) ? thisMain.intBillLineFun() : null;
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

    };

    Promise.all([p1, p2, p3]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result;
      thisMain._intBillLineInfo = resArr[1].result;
      thisMain._childLineInfo = resArr[2].result;

      /*
      * 자녀회선 요금 조회
      const subPromiseList = [];

      if ( thisMain._childLineInfo.length > 0 ) {
        for ( let i = 0; i < thisMain._childLineInfo.length; i++ ) {
          const subPromiseItem = thisMain._getPromiseApi(thisMain.apiService.request(API_CMD.BFF_05_0047, {
            childSvcMgmtNum: thisMain._childLineInfo[i].svcMgmtNum
          }), 'sub_p1');
          console.log('[자녀회선 프로미스]');
          console.dir( subPromiseItem );
          // @ts-ignore
          subPromiseList.push( subPromiseItem );
        }
        Promise.all( subPromiseList ).then( function(subRes) {
          console.log('[자녀회선 요금 조회 완료]');
          console.dir( subRes );
        });
      }
      */

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);

      thisMain.renderView(res, thisMain._urlTplInfo.combineRepresentPage, {
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
  // 통합청구(일반)
  private combineCommonCircuit(res, svcInfo) {
    const thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0047, {}), 'p1');

    const dataInit = function () {

    };

    Promise.all([p1]).then(function(resArr) {

      thisMain._useFeeInfo = resArr[0].result;

      dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.combineRepresentPage] : ', thisMain._urlTplInfo.combineRepresentPage);
      thisMain.renderView(res, thisMain._urlTplInfo.combineCommonPage, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        useFeeInfo: thisMain._useFeeInfo
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
  // 개별청구(일반)
  private individualCircuit(res, svcInfo) {
    const thisMain = this;
  }
  // PPS 선불폰
  private prepaidCircuit(res, svcInfo) {
    const thisMain = this;
  }
  // 기업솔루션
  private companyCircuit(res, svcInfo) {
    const thisMain = this;
  }
  // SK브로드밴드가입
  private skbroadbandCircuit(res, svcInfo) {
    const thisMain = this;
  }

  // -------------------------------------------------------------[SVC]
  public getSelStaDt(date: string): any { // 월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
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
