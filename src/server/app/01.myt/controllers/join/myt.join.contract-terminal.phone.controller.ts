/**
 * FileName: myt.joinService.contractTerminalInfo.phone.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import * as _ from 'underscore';
import contractTerminal_BFF_05_0063 from '../../../../mock/server/contractTerminal.BFF_05_0063.mock';


class MytJoinContractTerminalPhone extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any; // 쿼리스트링
  private _svcInfo: any;

  // 공통데이터
  private _commDataInfo: any = {
    feeInfo: [],
    terminalInfo: [],
    repaymentInfo: []
  };

  // 노출조건
  private _showConditionInfo: any = {};

  // 데이터
  private _resDataInfo: any = {};

  private _urlTplInfo: any = {
    pageRenderView: 'join/myt.join.contract-terminal.phone.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;
    const thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0063, {}), '테스트 api');
    const p1_mock = this._getPromiseApiMock(contractTerminal_BFF_05_0063, 'p1 Mock 데이터');

    Promise.all([p1_mock]).then(function (resArr) {
      console.dir(resArr);
      thisMain.logger.info(thisMain, `[ Promise.all ] : `, resArr);

      /*
      * 실 데이터 사용시
       */
      // resArr[0].subscribe({
      //   next( dataObj ) {
      //     thisMain.logger.info(thisMain, '[ next ] : ', dataObj);
      //   },
      //   error(error) {
      //     thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
      //   },
      //   complete() {
      //     thisMain.logger.info(thisMain, '[ complete ] : ');
      //
      //     thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
      //       reqQuery: thisMain.reqQuery,
      //       svcInfo: thisMain._svcInfo
      //     } );
      //
      //   }
      // });

      /*
      * Mock 데이터 사용시
       */
      thisMain._resDataInfo = resArr[0].result;
      thisMain._dataInit();

      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: thisMain._svcInfo,
        commDataInfo: thisMain._commDataInfo,
        resDataInfo: thisMain._resDataInfo
      });


    }); // Promise.all END

  } // render end

  private _dataInit() {
    this.logger.info(this, '[ _dataInit() start ]');

    const thisMain = this;
    this._commDataInfo.feeInfo = [];
    this._commDataInfo.terminalInfo = [];
    this._commDataInfo.repaymentInfo = [];

    // console.dir(thisMain._resDataInfo);

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
    if ( _.size(priceList) > 0 ) {
      for ( let i = 0; i < priceList.length; i++ ) {

        /*
        * 상품코드 분류(priceList.prodId)
        * 요금약정할인24 (730) : NA00003677 | type_A
        * 테블릿 약정할인 12 (뉴태블릿약정) : NA00003681 | type_B
        * 태블릿약정(구태블릿약정) : tablet 객체로 구분 | type_C
        * 해단분류에 포함되지않는 경우 | noType
         */
        if ( priceList[i].prodId === 'NA00003677' ) {
          priceList[i].typeStr = 'type_A';
          priceList[i].titNm = priceList[i].disProdNm;
        } else if ( priceList[i].prodId === 'NA00003681' ) {
          priceList[i].typeStr = 'type_B';
          priceList[i].titNm = '테블릿 약정할인 12';
        } else {
          priceList[i].typeStr = 'noType';
          priceList[i].titNm = priceList[i].disProdNm;
        }

        priceList[i].salePay = FormatHelper.addComma(priceList[i].agrmtDcAmt);
        thisMain._proDate(priceList[i], priceList[i].agrmtDcStaDt, priceList[i].agrmtDcEndDt);
        thisMain._commDataInfo.feeInfo.push(priceList[i]);
      }
    }
    if ( _.size(tablet) > 0 ) {
      tablet.titNm = '테블릿 약정';
      tablet.typeStr = 'type_C';
      tablet.salePay = FormatHelper.addComma(tablet.agrmtDcAmt);
      tablet.agrmtDayCntNum = FormatHelper.addComma(tablet.agrmtDayCnt);
      tablet.aGrmtPenAmtNum = FormatHelper.addComma(tablet.aGrmtPenAmt);
      thisMain._proDate(tablet, tablet.agrmtDcStaDt, tablet.agrmtDcEndDt);
      thisMain._commDataInfo.feeInfo.push(tablet);
    }
    if ( _.size(wibro) > 0 ) {
      wibro.titNm = 'wibro 약정';
      wibro.typeStr = 'noType';
      wibro.salePay = FormatHelper.addComma(wibro.agrmtDcAmt);
      thisMain._proDate(wibro, wibro.agrmtDcStaDt, wibro.agrmtDcEndDt);
      thisMain._commDataInfo.feeInfo.push(wibro);
    }
    this.logger.info(this, '[ 1. 요금약정할인 정보 this._commDataInfo.feeInfo ]');
    console.dir(this._commDataInfo.feeInfo);

    // -------------------------------------------------------------[2. 단말기 약정할인 정보]
    if ( _.size(tAgree) > 0 ) {
      tAgree.titNm = '가입 / ' + 'T 기본약정';

      /*
      *  T 기본약정 약정이름
       */
      tAgree.agreeNm = (function( strKey ) {
        let tempStr = '';
        switch ( strKey ) {
          case 'NoAgree' :
            tempStr = '무약정';
            break;
          case 'TInstallment' :
            tempStr = 'T할부지원';
            break;
          case 'TAgree' :
            tempStr = 'T기본약정';
            break;
          case 'TSupportAgree' :
            tempStr = 'T지원금약정';
            break;
        }
        return tempStr;
      })( tAgree.agrmtDivision );

      tAgree.agreeTotMonth = tAgree.agrmtMthCnt; // 약정 전체 개월수
      tAgree.agreePay = FormatHelper.addComma(tAgree.dcAmt); // 약정 금액
      tAgree.penalty = FormatHelper.addComma(tAgree.penAmt); // 위약금
      thisMain._proDate(tAgree, tAgree.staDt, tAgree.agrmtTermDt);
      thisMain._commDataInfo.terminalInfo.push(tAgree);
    }
    if ( _.size(tInstallment) > 0 ) {
      tInstallment.titNm = '가입 / ' + 'T 약정 할부지원';

      /*
      *  T 약정 할부지원 약정이름
       */
      tInstallment.agreeNm = (function() {
        return 'T 약정 할부지원';
      })();

      tInstallment.agreeTotMonth = tInstallment.allotMthCnt; // 약정 전체 개월수
      tInstallment.agreePay = FormatHelper.addComma(tInstallment.totAgrmtAmt); // 약정 금액
      tInstallment.penalty = FormatHelper.addComma(tInstallment.penAmt2); // 위약금
      const tInstallmentEndDt = moment(tInstallment.tInstallmentOpDt).add(tInstallment.allotMthCnt, 'months').format('YYYYMMDD');
      thisMain._proDate(tInstallment, tInstallment.tInstallmentOpDt, tInstallmentEndDt);
      thisMain._commDataInfo.terminalInfo.push(tInstallment);
    }
    if ( _.size(rsvPenTAgree) > 0 ) {
      rsvPenTAgree.titNm = '가입 / ' + '약정 위약금2(NEW)';

      /*
      *  T 약정 할부지원 약정이름
       */
      rsvPenTAgree.agreeNm = (function() {
        return '약정 위약금2(NEW)';
      })();

      rsvPenTAgree.agreeTotMonth = rsvPenTAgree.rtenAgrmtMthCnt; // 약정 전체 개월수
      rsvPenTAgree.agreePay = FormatHelper.addComma(rsvPenTAgree.rtenPenStrdAmt); // 약정 금액
      rsvPenTAgree.penalty = FormatHelper.addComma(rsvPenTAgree.rsvPenAmt); // 위약금
      thisMain._proDate(rsvPenTAgree, rsvPenTAgree.astamtOpDt, rsvPenTAgree.rtenAgrmtEndDt);
      thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
    }
    if ( _.size(sucesAgreeList) > 0 ) {
      for ( let i = 0; i < sucesAgreeList.length; i++ ) {
        sucesAgreeList[i].titNm = '승계 / ' + sucesAgreeList[i].bfEqpDcClNm;
        sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
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
    this.logger.info(this, '[ 2. 단말기 약정할인 정보 this._commDataInfo.terminalInfo ]');
    console.dir(this._commDataInfo.terminalInfo);

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
    this.logger.info(this, '[ 3. 단말기 분할 상환 정보 this._commDataInfo.repaymentInfo ]');
    console.dir(this._commDataInfo.repaymentInfo);

    this.logger.info(this, '[ _dataInit() end ]');

  }

  // -------------------------------------------------------------[서비스]
  private _proDate(dataObj: any, start: string, end: string) {
    this.logger.info(this, '[ 서비스 > _proDate ]');
    const startDt = start;
    const endDt = end;
    dataObj.startDt = DateHelper.getShortDateWithFormat(startDt, 'YYYY.MM.DD');
    dataObj.endDt = DateHelper.getShortDateWithFormat(endDt, 'YYYY.MM.DD');
    dataObj.totDt = moment(endDt, 'YYYYMMDD').diff(startDt, 'day');
    dataObj.curDt = moment(endDt, 'YYYYMMDD').diff(moment().format('YYYYMMDD'), 'day');
    dataObj.perDt = Math.floor((dataObj.curDt / dataObj.totDt) * 100); // 퍼센트
    dataObj.totMt = moment(endDt, 'YYYYMMDD').diff(startDt, 'month');
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수
  }

  /*
  * _proDateSuc
  * remnant : 잔여일수
   */
  private _proDateSuc(dataObj: any, start: string, end: string, remnant: string) {
    this.logger.info(this, '[ 서비스 > _proDateSuc ]');
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

  /*
  * 할인금액 : '-' 데이터
   */
  private _salePayFun(salePay: string) {
    const tempNum = Number(salePay);

    if ( tempNum >= 0) {


    } else {

    }

  }

  // -------------------------------------------------------------[프로미스 생성]
  public _getPromiseApi(reqObj, msg): any {
    const thisMain = this;
    // let tempData: any;
    const reqObjObservableApi: Observable<any> = reqObj;

    return new Promise((resolve, reject) => {
      Observable.combineLatest(
        reqObjObservableApi
      ).subscribe({
        next(reqObjObservable) {
          thisMain.logger.info(thisMain, `[ ${ msg } next ] : `, reqObjObservable);
          resolve(reqObjObservable);
        },
        error(error) {
          thisMain.logger.info(thisMain, `[ ${ msg } error ] : `, error.stack || error);
        },
        complete() {
          thisMain.logger.info(thisMain, `[ ${ msg } complete ] : `);

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
        resolve(mockData);
        // reject('실패');
      }, ms);
    });
  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }

}

export default MytJoinContractTerminalPhone;

