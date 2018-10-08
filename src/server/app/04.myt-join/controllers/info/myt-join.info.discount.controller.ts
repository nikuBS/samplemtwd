/**
 * FileName: myt-join.info.discount.controller.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE } from '../../../../types/string.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.old.type';
import * as _ from 'underscore';

class MytJoinInfoDiscount extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  private _svcInfo: any;

  // 데이터
  private _resDataInfo: any = {};

  // 공통데이터
  private _commDataInfo: any = {
    feeInfo: [], // 요금 약정 할인
    terminalInfo: [], // 단말기(약정할인)
    repaymentInfo: [] // 단말기 분할상환 정보
  };

  // default: 'info/myt-join.info.discount.html'
  private _urlTplInfo: any = {
    pageRenderView: 'info/myt-join.info.discount.html',
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // this._typeInit();

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0063, {}), 'p1');

    Promise.all([p1]).then(function(resArr) {

      thisMain._resDataInfo = resArr[0].result;

      thisMain._dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);

      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        commDataInfo: thisMain._commDataInfo,
        resDataInfo: thisMain._resDataInfo
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

    // thisMain.renderView(res, thisMain._urlTplInfo.default, {
    //   reqQuery: thisMain.reqQuery,
    //   svcInfo: svcInfo,
    // });
  }

  private _typeInit() {
    /*
    * 타입별로 render html 정함.
    * M1.휴대폰
    * M3.포켓파이
    * M4.로그인
    * M5.와이브로
    * S1/S2/S3.인터넷/IPTV/집전화
    * O1.보안 솔루션
     */
    switch ( this._svcInfo.svcAttrCd ) {
      case 'M1' :
        this.logger.info(this, '[ svcAttrCd : M1 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'info/myt-join.info.discount.html';
        break;
      case 'M3' :
        this.logger.info(this, '[ svcAttrCd : M3 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.tpocketfi.html';
        break;
      case 'M4' :
        this.logger.info(this, '[ svcAttrCd : M4 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.tlogin.html';
        break;
      case 'M5' :
        this.logger.info(this, '[ svcAttrCd : M5 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.twibro.html';
        break;
      case 'S1' :
      case 'S2' :
      case 'S3' :
        this.logger.info(this, '[ S1 / S2 / S3 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = '';
        break;
      case 'O1' :
        this.logger.info(this, '[ O1 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = '';
        break;
    }
  }

  private _dataInit() {
    this.logger.info(this, '[ _dataInit() start ]');

    const thisMain = this;
    this._commDataInfo.feeInfo = [];
    this._commDataInfo.terminalInfo = [];
    this._commDataInfo.repaymentInfo = [];

    const priceList = thisMain._resDataInfo.priceList;
    const tablet = thisMain._resDataInfo.tablet;
    const wibro = thisMain._resDataInfo.wibro;
    this.logger.info(this, '[ _.size(priceList) ]', _.size(priceList));
    this.logger.info(this, '[ _.size(tablet) ]', _.size(tablet));
    this.logger.info(this, '[ _.size(wibro) ]', _.size(wibro));

    const tAgree = thisMain._resDataInfo.tAgree;
    const tInstallment = thisMain._resDataInfo.tInstallment;
    const rsvPenTAgree = thisMain._resDataInfo.rsvPenTAgree;
    const sucesAgreeList = thisMain._resDataInfo.sucesAgreeList;
    this.logger.info(this, '[ _.size(tAgree) ]', _.size(tAgree));
    this.logger.info(this, '[ _.size(tInstallment) ]', _.size(tInstallment));
    this.logger.info(this, '[ _.size(rsvPenTAgree) ]', _.size(rsvPenTAgree));
    this.logger.info(this, '[ _.size(sucesAgreeList) ]', _.size(sucesAgreeList));

    const installmentList = thisMain._resDataInfo.installmentList;
    this.logger.info(this, '[ _.size(installmentList) ]', _.size(installmentList));

    // -------------------------------------------------------------[1. 요금약정할인 정보]
    /*
    * 상품코드 분류(priceList.prodId)
    * 요금약정할인24 (730) : NA00003677 | fee_type_A
    * 테블릿 약정할인 12 (뉴태블릿약정) : NA00003681 | fee_type_B
    * 태블릿약정(구태블릿약정) : tablet 객체로 구분 | fee_type_C
    * 와이브로약정할인 : wibro 객체로 구분 | fee_type_D
    * 해당분류에 포함되지않는 경우 | fee_noType // 와이브로 약정
    */

    if ( _.size(priceList) > 0 ) {
      for ( let i = 0; i < priceList.length; i++ ) {

        if ( priceList[i].prodId === 'NA00003677' ) {
          priceList[i].typeStr = 'fee_type_A';
          priceList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_A.TIT_NM;
        } else if ( priceList[i].prodId === 'NA00003681' ) {
          priceList[i].typeStr = 'fee_type_B';
          priceList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_B.TIT_NM;
        } else {
          priceList[i].typeStr = 'fee_noType';
          priceList[i].titNm = priceList[i].disProdNm;
        }

        priceList[i].salePay = FormatHelper.addComma(priceList[i].agrmtDcAmt);
        thisMain._proDate(priceList[i], priceList[i].agrmtDcStaDt, priceList[i].agrmtDcEndDt);
        thisMain._commDataInfo.feeInfo.push(priceList[i]);
      }
    }
    // 태블릿약정(구태블릿약정)
    if ( _.size(tablet) > 0 ) {
      tablet.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_C.TIT_NM;
      tablet.typeStr = 'fee_type_C';
      tablet.salePay = FormatHelper.addComma(tablet.agrmtDcAmt);
      tablet.agrmtDayCntNum = FormatHelper.addComma(tablet.agrmtDayCnt);
      tablet.aGrmtPenAmtNum = FormatHelper.addComma(tablet.aGrmtPenAmt);
      thisMain._proDate(tablet, tablet.agrmtDcStaDt, tablet.agrmtDcEndDt);
      thisMain._commDataInfo.feeInfo.push(tablet);
    }
    // 와이브로약정할인
    if ( _.size(wibro) > 0 ) {
      wibro.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_NOTYPE.TIT_NM; // 와이브로 약정
      wibro.typeStr = 'fee_type_D';
      wibro.salePay = FormatHelper.addComma(wibro.agrmtDcAmt);
      thisMain._proDate(wibro, wibro.agrmtDcStaDt, wibro.agrmtDcEndDt);
      thisMain._commDataInfo.feeInfo.push(wibro);
    }
    this.logger.info(this, '[ 1. this._commDataInfo.feeInfo ]');
    // console.dir(this._commDataInfo.feeInfo);

    // -------------------------------------------------------------[2. 단말기 약정할인 정보]
    if ( _.size(tAgree) > 0 ) {

      /*
      *  T 기본약정 분류(tAgree.agrmtDivision)
      *  가입/T기본약정 : 'TAgree' | join_type_A
      *  가입/T지원금약정 : 'TSupportAgree' | join_type_B
      *  가입/T약정할부지원 : tInstallment 객체로 구분 | join_type_C
      *  가입/약정위약금2 : rsvPenTAgree 객체로 구분 | join_type_D
      *  해당분류에 포함되지않는 경우 | join_noType
       */
      if ( tAgree.agrmtDivision === 'TAgree' ) {
        tAgree.typeStr = 'join_type_A';
        tAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_A.TITNM;
        tAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_A.AGREE_NM;
      } else if ( tAgree.agrmtDivision === 'TSupportAgree' ) {
        tAgree.typeStr = 'join_type_B';
        tAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_B.TITNM;
        tAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_B.AGREE_NM;
      } else {
        tAgree.typeStr = 'join_noType';
        tAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_NOTYPE.TITNM;
        tAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_NOTYPE.AGREE_NM;
      }

      tAgree.agreeTotMonth = tAgree.agrmtMthCnt; // 약정 전체 개월수
      tAgree.agreePay = FormatHelper.addComma(tAgree.dcAmt); // 약정 금액
      tAgree.penalty = FormatHelper.addComma(tAgree.penAmt); // 위약금
      thisMain._proDate(tAgree, tAgree.staDt, tAgree.agrmtTermDt);
      thisMain._commDataInfo.terminalInfo.push(tAgree);
    }
    if ( _.size(tInstallment) > 0 ) {
      tInstallment.typeStr = 'join_type_C';
      tInstallment.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.TITNM;
      tInstallment.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM;

      tInstallment.agreeTotMonth = tInstallment.allotMthCnt; // 약정 전체 개월수
      tInstallment.agreePay = FormatHelper.addComma(tInstallment.totAgrmtAmt); // 약정 금액
      tInstallment.penalty = FormatHelper.addComma(tInstallment.penAmt2); // 위약금
      const tInstallmentEndDt = moment(tInstallment.tInstallmentOpDt).add(tInstallment.allotMthCnt, 'months').format('YYYYMMDD');
      thisMain._proDate(tInstallment, tInstallment.tInstallmentOpDt, tInstallmentEndDt);
      thisMain._commDataInfo.terminalInfo.push(tInstallment);
    }
    if ( _.size(rsvPenTAgree) > 0 ) {
      rsvPenTAgree.typeStr = 'join_type_D';
      rsvPenTAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.TITNM;
      rsvPenTAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.AGREE_NM;

      rsvPenTAgree.agreeTotMonth = rsvPenTAgree.rtenAgrmtMthCnt; // 약정 전체 개월수
      rsvPenTAgree.agreePay = FormatHelper.addComma(rsvPenTAgree.rtenPenStrdAmt); // 약정 금액
      rsvPenTAgree.penalty = FormatHelper.addComma(rsvPenTAgree.rsvPenAmt); // 위약금
      thisMain._proDate(rsvPenTAgree, rsvPenTAgree.astamtOpDt, rsvPenTAgree.rtenAgrmtEndDt);
      thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
    }
    if ( _.size(sucesAgreeList) > 0 ) {

      for ( let i = 0; i < sucesAgreeList.length; i++ ) {
        /*
        * T 기본약정 분류(sucesAgreeList.bfEqpDcClCd)
        * 승계/T할부지원 : '1' | suc_type_A
        * 승계/T기본약정 : '2' | suc_type_B
        * 승계/약정위약금2 : '3' | suc_type_C
        * 승계/T지원금약정 : '7' | suc_type_D
        * 해당분류에 포함되지않는 경우 | suc_noType
         */
        if ( sucesAgreeList[i].bfEqpDcClCd === '1' ) {
          sucesAgreeList[i].typeStr = 'suc_type_A';
          sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_A.TITNM + sucesAgreeList[i].bfEqpDcClNm;
          sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
        } else if ( sucesAgreeList[i].bfEqpDcClCd === '2' ) {
          sucesAgreeList[i].typeStr = 'suc_type_B';
          sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_B.TITNM + sucesAgreeList[i].bfEqpDcClNm;
          sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
        } else if ( sucesAgreeList[i].bfEqpDcClCd === '3' ) {
          sucesAgreeList[i].typeStr = 'suc_type_C';
          sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_C.TITNM + sucesAgreeList[i].bfEqpDcClNm;
          sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
        } else if ( sucesAgreeList[i].bfEqpDcClCd === '7' ) {
          sucesAgreeList[i].typeStr = 'suc_type_D';
          sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_D.TITNM + sucesAgreeList[i].bfEqpDcClNm;
          sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
        } else {
          sucesAgreeList[i].typeStr = 'suc_noType';
          sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_NOTYPE.TITNM;
          sucesAgreeList[i].agreeNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_NOTYPE.AGREE_NM;
        }

        sucesAgreeList[i].agreeTotMonth = sucesAgreeList[i].agrmtMthCnt; // 약정 전체 개월수
        sucesAgreeList[i].agreePay = FormatHelper.addComma(sucesAgreeList[i].agrmtDcAmt); // 약정 금액
        sucesAgreeList[i].penalty = FormatHelper.addComma(sucesAgreeList[i].sucesPenAmt); // 위약금

        thisMain._proDateSuc(sucesAgreeList[i],
          sucesAgreeList[i].sucesAgrmtStaDt,
          sucesAgreeList[i].sucesAgrmtEndDt,
          sucesAgreeList[i].sucesRemDayCnt);

        thisMain._commDataInfo.terminalInfo.push(sucesAgreeList[i]);
      }
    }
    this.logger.info(this, '[ 2. this._commDataInfo.terminalInfo ]');
    // console.dir(this._commDataInfo.terminalInfo);

    // -------------------------------------------------------------[3. 단말기 분할 상환 정보]
    if ( _.size(installmentList) > 0 ) {
      for ( let i = 0; i < installmentList.length; i++ ) {
        installmentList[i].titNm = installmentList[i].eqpMdlNm;

        installmentList[i].totSubsidy = FormatHelper.addComma(installmentList[i].allotApprAmt); // 총 할부지원금액
        installmentList[i].agreeClaimPay = FormatHelper.addComma(installmentList[i].invBamt); // 잔여할부청구금액

        const installmentListEndDt = moment(installmentList[i].allotStaDt).add(installmentList[i].allotMthCnt, 'months').format('YYYYMMDD');
        thisMain._proDate(installmentList[i], installmentList[i].allotStaDt, installmentListEndDt);
        thisMain._commDataInfo.repaymentInfo.push(installmentList[i]);
      }
    }
    this.logger.info(this, '[ 3. this._commDataInfo.repaymentInfo ]');
    // console.dir(this._commDataInfo.repaymentInfo);

    this.logger.info(this, '[ _dataInit() end ]');

  }
  // -------------------------------------------------------------[SVC]
  private _proDate(dataObj: any, start: string, end: string) {
    const startDt = start;
    const endDt = end;
    this.logger.info(this, '[ _proDate ]', startDt, endDt);
    dataObj.startDt = DateHelper.getShortDateWithFormat(startDt, 'YYYY.MM.DD');
    dataObj.endDt = DateHelper.getShortDateWithFormat(endDt, 'YYYY.MM.DD');
    dataObj.totDt = moment(endDt, 'YYYYMMDD').diff(startDt, 'day');
    // dataObj.curDt = moment(endDt, 'YYYYMMDD').diff(moment().format('YYYYMMDD'), 'day');
    dataObj.curDt = moment(endDt, 'YYYYMMDD').diff(startDt, 'day');
    dataObj.perDt = Math.floor((dataObj.curDt / dataObj.totDt) * 100); // 퍼센트
    dataObj.totMt = moment(endDt, 'YYYYMMDD').diff(startDt, 'month');
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수
  }

  /*
  * _proDateSuc
  * remnant : 잔여일수
   */
  private _proDateSuc(dataObj: any, start: string, end: string, remnant: string) {
    const startDt = start;
    const endDt = end;
    const remnantDt = moment(endDt, 'YYYYMMDD').subtract(remnant, 'day').format('YYYYMMDD'); // 진행날짜
    dataObj.startDt = DateHelper.getShortDateWithFormat(startDt, 'YYYY.MM.DD');
    dataObj.endDt = DateHelper.getShortDateWithFormat(endDt, 'YYYY.MM.DD');
    dataObj.totDt = moment(endDt, 'YYYYMMDD').diff(startDt, 'day');
    dataObj.curDt = moment(endDt, 'YYYYMMDD').diff(remnantDt, 'day');
    dataObj.perDt = Math.floor((dataObj.curDt / dataObj.totDt) * 100); // 퍼센트
    dataObj.totMt = moment(endDt, 'YYYYMMDD').diff(startDt, 'month');
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수
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

export default MytJoinInfoDiscount;
