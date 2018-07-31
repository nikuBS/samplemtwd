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
import contractTerminal_BFF_05_0063 from '../../../../mock/server/contractTerminal.BFF_05_0063.mock';


class MytJoinContractTerminalPhone extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any; // 쿼리스트링
  private _svcInfo: any;

  // 공통데이터
  private _commDataInfo: any = {
    feeInfo: null,
    terminalInfo: [],
    repaymentInfo: null
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
    const iDiscountCnt = thisMain._resDataInfo.iDiscountCnt;
    const eqpAgrmetCnt = thisMain._resDataInfo.eqpAgrmetCnt;

    // 01. T약정할부 + T약정할부위약금2 ==> Case 3 T약정 할부 + T약정 할부 승계 경우
    const iTInstallmentCnt = thisMain._resDataInfo.iTInstallmentCnt;
    const iRsvPenTInstallmentCnt = thisMain._resDataInfo.iRsvPenTInstallmentCnt;

    // 02. T기본약정 + T기본약정위약금2
    const iTAgreeCnt = thisMain._resDataInfo.iTAgreeCnt;
    const iTSupportAgreeCnt = thisMain._resDataInfo.iTSupportAgreeCnt;
    const iRsvPenTAgreeCnt = thisMain._resDataInfo.iRsvPenTAgreeCnt;
    const iRsvPenTSupportAgreeCnt = thisMain._resDataInfo.iRsvPenTSupportAgreeCnt;

    // 무약정 약정위약금2 ==> Case 5 약정 위약금2 경우
    const iRsvPenNoAgreeCnt = thisMain._resDataInfo.iRsvPenNoAgreeCnt;

    // 03. 승계정보 | 승계된 (약정)할인 정보 ==> Case 3 T약정 할부 + T약정 할부 승계 경우, Case 4 T기본 약정 + T할부지원승계 경우
    const isSuces = thisMain._resDataInfo.isSuces;
    const sBfEqpDcClCd = thisMain._resDataInfo.sBfEqpDcClCd; // 문의중!! 키, 벨류 값이 없음.
    const BfEqpDcClCd = thisMain._resDataInfo.BfEqpDcClCd;

    // 04. 요금약정할인(태블릿약정 / 뉴 태블릿약정 / 요금약정) [[ ==> Case 8 구/뉴 태블릿 약정 가입 경우
    const feeAgrmtCnt = thisMain._resDataInfo.feeAgrmtCnt;
    const tabletUser = thisMain._resDataInfo.tabletUser; // 테블릿 약정 ==> Case 6 구 태블릿 약정 가입 경우
    const agrmtUser = thisMain._resDataInfo.agrmtUser; // 요금 약정==> Case 7 뉴 태블릿 약정 가입 경우

    // 05. 와이브로 요금 약정 일 경우
    const wibroUser = thisMain._resDataInfo.wibroUser;

    const isInstallment = thisMain._resDataInfo.isInstallment; // 단말기할부 유무

    const tAgree = thisMain._resDataInfo.tAgree; //  T 기본약정 | {}
    const tInstallment = thisMain._resDataInfo.tInstallment; // T 약정 할부지원 | {}
    const rsvPenTAgree = thisMain._resDataInfo.rsvPenTAgree; // 약정 위약금2(NEW) | {}
    const tablet = thisMain._resDataInfo.tablet; // 태블릿 약정할인 | {}
    const wibro = thisMain._resDataInfo.wibro; // 와이브로약정할인 | {}

    const priceList = thisMain._resDataInfo.priceList; // 요금약정할인 | []
    const sucesAgreeList = thisMain._resDataInfo.sucesAgreeList; // 승계된 약정정보 | []
    const installmentList = thisMain._resDataInfo.installmentList; // 단말기 할부 | []


    if ( iDiscountCnt > 0 ) { // 약정의 갯수
      // -------------------------------------------------------------[1. 요금약정할인 정보]
      if ( feeAgrmtCnt > 0 ) { // 요금약정갯수
        if ( tabletUser === 'Y' ) { // 태블릿 약정 가입 여부 | Case 6 구 태블릿 약정
          this.logger.info(this, '[ 요금약정 > 태블릿 약정 ]', tabletUser);
          thisMain._commDataInfo.feeInfo = priceList;
        }
        if ( agrmtUser === 'Y' ) { // 요금약정할인 가입 여부 | Case 7 뉴 태블릿 약정
          this.logger.info(this, '[ 요금약정 > 요금약정할인 ]', agrmtUser);
          thisMain._commDataInfo.feeInfo = priceList;
        }
      }

      // -------------------------------------------------------------[2. 단말기 약정할인 정보]
      if ( eqpAgrmetCnt > 0 ) { // 단말약정갯수

      }

      /*
      * Case 3 T약정할부지원 + T약정 할부 승계 경우
       */
      if ( (iTInstallmentCnt + iRsvPenTInstallmentCnt) > 0 ) { // T약정할부지원 갯수 + T약정할부지원 위약금 2 갯수
        if ( iTInstallmentCnt > 0 ) { // T약정 할부 지원
          // tInstallment
          this.logger.info(this, '[ 단말기약정 > iTInstallmentCnt ]', iTInstallmentCnt);
          tInstallment.titNm = '가입/T약정 할부 지원';
          thisMain._commDataInfo.terminalInfo.push(tInstallment);
        }
        if ( iRsvPenTInstallmentCnt > 0 ) { // 약정 위약금2
          // rsvPenTAgree
          this.logger.info(this, '[ 단말기약정 > iRsvPenTInstallmentCnt ]', iRsvPenTInstallmentCnt);
          rsvPenTAgree.titNm = '가입/약정 위약금2';
          thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
        }
      }

      /*
      * T기본 약정 + T지원금 약정 + T기본약정 약정위약금 2 + T지원금약정 약정위약금 2
       */
      if ( (iTAgreeCnt + iTSupportAgreeCnt + iRsvPenTAgreeCnt + iRsvPenTSupportAgreeCnt) > 0 ) {
        if ( iTAgreeCnt > 0 ) { // T기본 약정
          // tAgree
          this.logger.info(this, '[ 단말기약정 > iTAgreeCnt ]', iTAgreeCnt);
          tAgree.titNm = '가입/T기본 약정';
          thisMain._commDataInfo.terminalInfo.push(tAgree);
        }
        if ( iTSupportAgreeCnt > 0 ) { // T지원금 약정
          // tAgree
          this.logger.info(this, '[ 단말기약정 > iTSupportAgreeCnt ]', iTSupportAgreeCnt);
          tAgree.titNm = '가입/T지원금 약정';
          thisMain._commDataInfo.terminalInfo.push(tAgree);
        }
        if ( iRsvPenTAgreeCnt > 0 ) { // T기본약정 약정위약금2
          // rsvPenTAgree
          this.logger.info(this, '[ 단말기약정 > iRsvPenTAgreeCnt ]', iRsvPenTAgreeCnt);
          rsvPenTAgree.titNm = '가입/T기본약정 약정위약금2';
          thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
        }
        if ( iRsvPenTSupportAgreeCnt > 0 ) { // T지원금약정 약정위약금2
          // rsvPenTAgree
          this.logger.info(this, '[ 단말기약정 > iRsvPenTSupportAgreeCnt ]', iRsvPenTSupportAgreeCnt);
          rsvPenTAgree.titNm = '가입/T지원금약정 약정위약금2';
          thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
        }

      }

      if ( iRsvPenNoAgreeCnt > 0 ) {// 무약정 약정위약금 2
        // rsvPenTAgree
        this.logger.info(this, '[ 단말기약정 > iRsvPenNoAgreeCnt ]', iRsvPenNoAgreeCnt);
        rsvPenTAgree.titNm = '가입/무약정 약정위약금2';
        thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
      }

      /*
      * 03. 승계정보 : sucesAgreeList
      * BfEqpDcClCd : 할인구분코드
       */
      if ( isSuces === 'Y' ) { // 승계정보 여부 : Y / N

        if ( BfEqpDcClCd === '1' ) { // T약정 할부 지원
          // sucesAgreeList
          this.logger.info(this, '[ 단말기약정 승계 > BfEqpDcClCd > 1 ]', BfEqpDcClCd);
          sucesAgreeList.titNm = '승계/T약정 할부 지원';
          thisMain._commDataInfo.terminalInfo.push(sucesAgreeList);
        }
        if ( BfEqpDcClCd === '2' ) { //
          // sucesAgreeList
          this.logger.info(this, '[ 단말기약정 승계 > BfEqpDcClCd > 2 ]', BfEqpDcClCd);
          sucesAgreeList.titNm = '승계/T기본 약정';
          thisMain._commDataInfo.terminalInfo.push(sucesAgreeList);
        }
        if ( BfEqpDcClCd === '3' ) { //
          // sucesAgreeList
          this.logger.info(this, '[ 단말기약정 승계 > BfEqpDcClCd > 3 ]', BfEqpDcClCd);
          sucesAgreeList.titNm = '승계/약정 위약금2';
          thisMain._commDataInfo.terminalInfo.push(sucesAgreeList);
        }
        if ( wibroUser === '7' ) { //
          // sucesAgreeList
          this.logger.info(this, '[ 단말기약정 승계 > BfEqpDcClCd > 7 ]', wibroUser);
          sucesAgreeList.titNm = '승계/T지원금 약정';
          thisMain._commDataInfo.terminalInfo.push(sucesAgreeList);
        }

      }

      if ( wibroUser === 'Y' ) { // 와이브로 약정 가입 여부
        this.logger.info(this, '[ 단말기약정 > wibroUser ]', wibroUser);
        thisMain._commDataInfo.terminalInfo.push(sucesAgreeList);
      }

    }

    // -------------------------------------------------------------[3. 단말기 분할 상환 정보]
    if ( installmentList.length > 0 ) {
      if ( isInstallment === 'Y' ) { // 단말기할부 유무
        // installmentList 단말기 할부
        this.logger.info(this, '[ 단말기할부 ]', isInstallment);
        thisMain._commDataInfo.repaymentInfo = installmentList;
      }
    }


    this.logger.info(this, '[ _dataInit() end ]');
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

