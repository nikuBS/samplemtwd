/**
 * MenuName: 나의 가입정보 > 약정할인/기기상환 정보(MS_09)
 * @file myt-join.info.discount.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.04
 * Summary: 약정정보, 기기상환 정보 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE, TIME_UNIT } from '../../../../types/string.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.type';
import contractTerminal_BFF_05_0063 from '../../../../mock/server/contractTerminal.BFF_05_0063.mock';

class MytJoinInfoDiscount extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  public pageInfo: any;
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // this._typeInit();

    // 주의: API 버전 다운시 url 변경있음 -> 명세서 확인 필요
    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2), 'p1');
    // const p1 = this._getPromiseApiMock( contractTerminal_BFF_05_0063, 'p1' );

    Promise.all([p1]).then(function(resArr) {

      thisMain._resDataInfo = resArr[0].result;

      thisMain._dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);

      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        commDataInfo: thisMain._commDataInfo,
        resDataInfo: thisMain._resDataInfo
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

    // thisMain.renderView(res, thisMain._urlTplInfo.default, {
    //   reqQuery: thisMain.reqQuery,
    //   svcInfo: svcInfo,
    // });
  }

  // 안씀
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

  /**
   * 데이터 조회 후 화면 출력을 위해 세팅
   * @private
   */
  private _dataInit() {
    this.logger.info(this, '[ _dataInit() start ]');

    const thisMain = this;
    this._commDataInfo.feeInfo = [];
    this._commDataInfo.terminalInfo = [];
    this._commDataInfo.repaymentInfo = [];
    this._commDataInfo.tRental = null;

    const priceList = thisMain._resDataInfo.priceList;
    this.logger.info(this, '[ (priceList) ]', this.getSizeObjOrArr(priceList));

    const tAgree = thisMain._resDataInfo.tAgree;
    const tInstallment = thisMain._resDataInfo.tInstallment;
    const rsvPenTAgree = thisMain._resDataInfo.rsvPenTAgree;
    const sucesAgreeList = thisMain._resDataInfo.sucesAgreeList;
    this.logger.info(this, '[ (tAgree) ]', this.getSizeObjOrArr(tAgree));
    this.logger.info(this, '[ (tInstallment) ]', this.getSizeObjOrArr(tInstallment));
    this.logger.info(this, '[ (rsvPenTAgree) ]', this.getSizeObjOrArr(rsvPenTAgree));
    this.logger.info(this, '[ (sucesAgreeList) ]', this.getSizeObjOrArr(sucesAgreeList));
    this.logger.info(this, '[ (tRental) ]', this.getSizeObjOrArr(thisMain._resDataInfo.tRental));

    const installmentList = thisMain._resDataInfo.installmentList;
    this.logger.info(this, '[ (installmentList) ]', this.getSizeObjOrArr(installmentList));

    const tablet = thisMain._resDataInfo.tablet;
    const wibro = thisMain._resDataInfo.wibro;
    this.logger.info(this, '[ (tablet) ]', this.getSizeObjOrArr(tablet));
    this.logger.info(this, '[ (wibro) ]', this.getSizeObjOrArr(wibro));

    // -------------------------------------------------------------[1. 요금약정할인 정보]
    /*
    * 상품코드 분류(priceList.prodId)
    * 요금약정할인24 (730) : NA00003677 | fee_type_A | 상세할인 내역보기
    * 테블릿 약정할인 12 (뉴태블릿약정) : NA00003681 | fee_type_B | 상세할인 내역보기
    * 선택약정할인제도 : NA00004430 | fee_type_E | 상세할인 내역보기
    * 해당분류에 포함되지않는 경우 | fee_noType
    */

    if ( this.getSizeObjOrArr(priceList) > 0 ) {
      for ( let i = 0; i < priceList.length; i++ ) {

        switch ( priceList[i].prodId ) {

          case 'NA00003677': // 요금약정할인24 (730)
            // 반올림으로 개월을 계산
            const month = Math.round(
              moment(priceList[i].agrmtDcEndDt, 'YYYYMMDD').diff(priceList[i].agrmtDcStaDt, 'months', true)
            );
            priceList[i].typeStr = 'fee_type_A';
            priceList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_A.TIT_NM + '(' + month + TIME_UNIT.MONTH + ')';
            priceList[i].disProdNm2 = this.trimAll(priceList[i].disProdNm);
            priceList[i].svcAgrmtDcObj = {
              svcAgrmtDcId : priceList[i].svcAgrmtDcId || '',
              svcAgrmtDcCd : priceList[i].svcAgrmtDcCd || ''
            };
            break;
          case 'NA00003681': // 뉴태블릿약정
            priceList[i].typeStr = 'fee_type_B';
            priceList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_B.TIT_NM;
            priceList[i].svcAgrmtDcObj = {
              svcAgrmtDcId : priceList[i].svcAgrmtDcId || '',
              svcAgrmtDcCd : priceList[i].svcAgrmtDcCd || ''
            };
            break;
          case 'NA00004430': // 선택약정할인
            priceList[i].typeStr = 'fee_type_E';
            // 반올림으로 개월을 계산
            const month2 = Math.round(
              moment(priceList[i].agrmtDcEndDt, 'YYYYMMDD').diff(priceList[i].agrmtDcStaDt, 'months', true)
            );
            priceList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_E.TIT_NM + '(' + month2 + TIME_UNIT.MONTH + ')';
            priceList[i].disProdNm2 = this.trimAll(priceList[i].disProdNm);
            priceList[i].svcAgrmtDcObj = {
              svcAgrmtDcId : priceList[i].svcAgrmtDcId || '',
              svcAgrmtDcCd : priceList[i].svcAgrmtDcCd || ''
            };
            break;
          default:
            priceList[i].typeStr = 'fee_noType';
            priceList[i].titNm = priceList[i].disProdNm; // 할인 상품명
            priceList[i].svcAgrmtDcObj = {
              svcAgrmtDcId : priceList[i].svcAgrmtDcId || '',
              svcAgrmtDcCd : priceList[i].svcAgrmtDcCd || ''
            };
        }

        priceList[i].salePay = FormatHelper.addComma(priceList[i].agrmtDcAmt);
        thisMain._proDate(
          priceList[i],
          priceList[i].agrmtDcStaDt,
          priceList[i].agrmtDcEndDt);
        thisMain._commDataInfo.feeInfo.push(priceList[i]);
      }
    }

    // 테블릿
    if ( this.getSizeObjOrArr(tablet) > 0 ) {

      tablet.typeStr = 'fee_noType';
      tablet.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_C.TIT_NM;
      tablet.agrmtDcAmt = FormatHelper.addComma(tablet.agrmtDcAmt);
      tablet.agrmtDayCnt = FormatHelper.addComma(tablet.agrmtDayCnt);
      tablet.aGrmtPenAmt = FormatHelper.addComma(tablet.aGrmtPenAmt);
      thisMain._proDate(
        tablet,
        tablet.agrmtDcStaDt,
        tablet.agrmtDcEndDt);

      thisMain._commDataInfo.feeInfo.push(tablet);
    }

    // // 와이브로
    // if ( this.getSizeObjOrArr(wibro) > 0 ) {
    //
    //   wibro.typeStr = 'fee_noType';
    //   wibro.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_D.TIT_NM;
    //   wibro.agrmtDcAmt = FormatHelper.addComma(tablet.agrmtDcAmt);
    //   wibro.agrmtDayCnt = FormatHelper.addComma(tablet.agrmtDayCnt);
    //   wibro.aGrmtPenAmt = FormatHelper.addComma(tablet.aGrmtPenAmt);
    //   thisMain._proDate(
    //     wibro,
    //     wibro.agrmtDcStaDt,
    //     wibro.agrmtDcEndDt);
    //
    //   thisMain._commDataInfo.feeInfo.push(wibro);
    // }




    this.logger.info(this, '[ 1. this._commDataInfo.feeInfo ]');
    // console.dir(this._commDataInfo.feeInfo);

    // -------------------------------------------------------------[2. 단말기 약정할인 정보]
    if ( this.getSizeObjOrArr(tAgree) > 0 ) {

      /*
      *  T 기본약정 분류(tAgree.agrmtDivision)
      *  가입/T지원금약정 : 'TSupportAgree' | join_type_B
      *  가입/T약정할부지원 : tInstallment 객체로 구분 | join_type_C
      *  가입/약정위약금2 : rsvPenTAgree 객체로 구분 | join_type_D
      *  해당분류에 포함되지않는 경우 | join_noType
       */

      switch ( tAgree.agrmtDivision ) {

        case 'TSupportAgree':
          tAgree.typeStr = 'join_type_B';
          tAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_B.TITNM; // 가입/T지원금약정
          tAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_B.AGREE_NM;
          break;
        default:
          tAgree.typeStr = 'join_noType';
          tAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_NOTYPE.TITNM;
          tAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_NOTYPE.AGREE_NM;
      }

      tAgree.agreeTotMonth = tAgree.agrmtMthCnt; // 약정 전체 개월수
      tAgree.agreePay = FormatHelper.addComma(tAgree.dcAmt); // 약정 금액
      tAgree.penalty = FormatHelper.addComma(tAgree.penAmt); // 위약금
      thisMain._proDate(
        tAgree,
        tAgree.staDt,
        tAgree.agrmtTermDt,
        tAgree.rmnDayCnt );

      thisMain._commDataInfo.terminalInfo.push(tAgree);
    }

    if ( this.getSizeObjOrArr(tInstallment) > 0 ) { // T약정 할부지원
      tInstallment.typeStr = 'join_type_C';
      tInstallment.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.TITNM;
      tInstallment.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM;

      // 약정 위약금2와 함께 가입한 경우 상품명 변경
      if ( this.getSizeObjOrArr(rsvPenTAgree) > 0 ) {
        tInstallment.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.TITNM2;
        tInstallment.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM2;
      }
      
      tInstallment.agreeTotMonth = tInstallment.allotMthCnt; // 약정 전체 개월수
      tInstallment.agreePay = FormatHelper.addComma(tInstallment.totAgrmtAmt); // 약정 금액
      tInstallment.penalty = FormatHelper.addComma(tInstallment.penAmt2); // 위약금
      const tInstallmentEndDt = moment(tInstallment.tInstallmentOpDt).add(tInstallment.allotMthCnt, 'months').format('YYYYMMDD');
      thisMain._proDate(tInstallment, tInstallment.tInstallmentOpDt, tInstallmentEndDt);
      thisMain._commDataInfo.terminalInfo.push(tInstallment);
    }

    if ( this.getSizeObjOrArr(rsvPenTAgree) > 0 ) { // 약정 위약금2
      rsvPenTAgree.typeStr = 'join_type_D';
      rsvPenTAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.TITNM;
      rsvPenTAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.AGREE_NM;

      rsvPenTAgree.agreeTotMonth = rsvPenTAgree.rtenAgrmtMthCnt; // 약정 전체 개월수
      rsvPenTAgree.agreePay = FormatHelper.addComma(rsvPenTAgree.rtenPenStrdAmt); // 약정 금액
      rsvPenTAgree.penalty = FormatHelper.addComma(rsvPenTAgree.rsvPenAmt); // 위약금

      thisMain._proDate(
        rsvPenTAgree,
        rsvPenTAgree.astamtOpDt,
        rsvPenTAgree.rtenAgrmtEndDt,
        rsvPenTAgree.remDayCnt );

      thisMain._commDataInfo.terminalInfo.push(rsvPenTAgree);
    }
    if ( this.getSizeObjOrArr(sucesAgreeList) > 0 ) { // 단말기 승계 정보

      for ( let i = 0; i < sucesAgreeList.length; i++ ) {
        /*
        * T 기본약정 분류(sucesAgreeList.bfEqpDcClCd)
        * 승계/T약정 할부지원 : '1' | suc_type_A
        * 승계/T기본약정 : '2' | suc_type_B
        * 승계/약정위약금2 : '3' | suc_type_C
        * 승계/T지원금약정 : '7' | suc_type_D
        * 해당분류에 포함되지않는 경우 | suc_noType
         */
        switch ( sucesAgreeList[i].bfEqpDcClCd ) {

          case '1':
            sucesAgreeList[i].typeStr = 'suc_type_A';
            sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_A.TITNM + sucesAgreeList[i].bfEqpDcClNm;
            sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
            // 약정위약금2가 존재하면 이름 변경
            for ( let j = 0; j < sucesAgreeList.length; j++ ) {
              if ( sucesAgreeList[i].bfEqpDcClCd === '3' ) {
                sucesAgreeList[i].agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM2;
                sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_A.TITNM + sucesAgreeList[i].agreeNm;
              }
            }
            break;

          case '2':
            sucesAgreeList[i].typeStr = 'suc_type_B';
            sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_B.TITNM + sucesAgreeList[i].bfEqpDcClNm;
            sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
            break;

          case '3':
            sucesAgreeList[i].typeStr = 'suc_type_C';
            sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_C.TITNM + sucesAgreeList[i].bfEqpDcClNm;
            sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
            break;

          case '7':
            sucesAgreeList[i].typeStr = 'suc_type_D';
            sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_TYPE_D.TITNM + sucesAgreeList[i].bfEqpDcClNm;
            sucesAgreeList[i].agreeNm = sucesAgreeList[i].bfEqpDcClNm;
            break;

          default:
            sucesAgreeList[i].typeStr = 'suc_noType';
            sucesAgreeList[i].titNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_NOTYPE.TITNM;
            sucesAgreeList[i].agreeNm = MYT_JOIN_CONTRACT_TERMINAL.SUC_NOTYPE.AGREE_NM;
        }

        sucesAgreeList[i].agreeTotMonth = sucesAgreeList[i].agrmtMthCnt; // 약정 전체 개월수
        sucesAgreeList[i].agreePay = FormatHelper.addComma(sucesAgreeList[i].agrmtDcAmt); // 약정 금액
        sucesAgreeList[i].penalty = FormatHelper.addComma(sucesAgreeList[i].sucesPenAmt); // 위약금

        thisMain._proDate(sucesAgreeList[i],
          sucesAgreeList[i].sucesAgrmtStaDt,
          sucesAgreeList[i].sucesAgrmtEndDt,
          sucesAgreeList[i].sucesRemDayCnt);

        thisMain._commDataInfo.terminalInfo.push(sucesAgreeList[i]);
      }
    }
    this.logger.info(this, '[ 2. this._commDataInfo.terminalInfo ]');
    // console.dir(this._commDataInfo.terminalInfo);

    // -------------------------------------------------------------[3. 단말기 분할 상환 정보]
    if ( this.getSizeObjOrArr(installmentList) > 0 ) {
      for ( let i = 0; i < installmentList.length; i++ ) {
        installmentList[i].titNm = installmentList[i].eqpMdlNm;

        installmentList[i].totSubsidy = FormatHelper.addComma(installmentList[i].allotApprAmt); // 총 할부지원금액
        installmentList[i].agreeClaimPay = FormatHelper.addComma(installmentList[i].invBamt); // 잔여할부청구금액

        const installmentListEndDt = moment(installmentList[i].allotStaDt).add(installmentList[i].allotMthCnt, 'months').format('YYYYMMDD');

        thisMain._proDateRemMt(
          installmentList[i],
          installmentList[i].allotStaDt, installmentListEndDt );

        // 분할상환금, 분할상환수수료
        installmentList[i].mthPrnAmt = FormatHelper.addComma(installmentList[i].mthprnAmt || '0');
        installmentList[i].mthIntAmt = FormatHelper.addComma(installmentList[i].mthintAmt || '0');

        // 중도부분납금, 중도부분납일
        installmentList[i].allotPayAmt = FormatHelper.addComma(installmentList[i].allotPayAmt || '0');
        installmentList[i].lastAllotPayOpTm
          = installmentList[i].lastAllotPayOpTm ? DateHelper.getShortDate(installmentList[i].lastAllotPayOpTm) : '-';

        thisMain._commDataInfo.repaymentInfo.push(installmentList[i]);
      }
    }
    this.logger.info(this, '[ 3. this._commDataInfo.repaymentInfo ]');
    // console.dir(this._commDataInfo.repaymentInfo);


    // 단말기 구매정보(T렌탈)
    if ( this.getSizeObjOrArr(thisMain._resDataInfo.tRental) > 0 ) {
      this._commDataInfo.tRental = thisMain._resDataInfo.tRental;
      this._commDataInfo.tRental.rentalStaDt = DateHelper.getShortDate(this._commDataInfo.tRental.rentalStaDt);
      this._commDataInfo.tRental.allotEndSchdDt = DateHelper.getShortDate(this._commDataInfo.tRental.allotEndSchdDt);
      this._commDataInfo.tRental.mthRentAmt = FormatHelper.addComma(this._commDataInfo.tRental.mthRentAmt);
    }


    this.logger.info(this, '[ _dataInit() end ]');

  }
  // -------------------------------------------------------------[SVC]

  /**
   * 날짜계산 (날짜계산은 첫날을 포함해서 계산 - 이진영수석, 김용혁 매니저와 legacy 확인 후 협의 정리된 내용(2019.02.28))
   * @param dataObj 계산된 날짜 넣을 object
   * @param start - 시작일자
   * @param end - 종료일자
   * @param remnant - 남은일수
   * @private
   */
  private _proDate(dataObj: any, start: string, end: string, remnant: any = null) {
    this.logger.info(this, '[ _proDate ] param stt:', start, ', end:', end, ', rem:', remnant);
    const startDt = start;
    const endDt = end;
    // const useDt = moment().format('YYYYMMDD'); // 진행날짜
    const useDt = DateHelper.getCurrentShortDate(new Date()); // 진행날짜

    dataObj.startDt = DateHelper.getShortDate(startDt);
    dataObj.endDt = DateHelper.getShortDate(endDt);

    // dataObj.totDt = moment(endDt, 'YYYYMMDD').diff(startDt, 'day') + 1; // 전체 일수
    // dataObj.curDt = moment(useDt, 'YYYYMMDD').diff(startDt, 'day'); // 진행 일수
    dataObj.totDt = DateHelper.getDiffByUnit(endDt, startDt, 'day') + 1;  // 전체 일수(첫날 포함)
    dataObj.curDt = DateHelper.getDiffByUnit(useDt, startDt, 'day');  // 진행 일수(첫날 미포함, 잔여일수 계산을 위해)
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수

    dataObj.perDt = 100 - Math.floor((dataObj.curDt / dataObj.totDt) * 100); // 퍼센트(잔여일수에 대한..)
    dataObj.perDt = this.limitMinMax(dataObj.perDt, 0, 100);  // 퍼센트 min:0, max:100
    dataObj.totMt = Math.round(
      moment(endDt, 'YYYYMMDD').diff(startDt, 'months', true)
    );

    this.logger.info(this, '[ _proDate ] stt:', startDt , ', end:', endDt
      , ', tot:', dataObj.totDt, ', ing:', dataObj.curDt, ', rem:' + dataObj.remDt
      , ', per(rem):' + dataObj.perDt, ', totMt:' + dataObj.totMt);
  }

  /*
  * _proDateRemMt
  * remnant : 잔여 개월수
   */
  private _proDateRemMt( dataObj: any, start: string, end: string ) {
    const startDt = start;
    const endDt = end;

    dataObj.startDt = DateHelper.getShortDate(startDt);
    dataObj.endDt = DateHelper.getShortDate(endDt);

    dataObj.totMt = dataObj.allotMthCnt; // 전체 개월
    dataObj.curMt = dataObj.allotMthCnt - dataObj.invRmn; // 진행 개월
    dataObj.remMt = dataObj.invRmn; // 잔여 개월

    dataObj.perMt = 100 - Math.floor((dataObj.curMt / dataObj.totMt) * 100); // 퍼센트
    dataObj.perMt = this.limitMinMax(dataObj.perMt, 0, 100);
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
    res.render(view, data);
  }

  // -------------------------------------------------------------[COM]
  public getSizeObjOrArr(obj): any {

    if ( !obj ) {
      return -1;
    }

    let tempLen;

    if ( Array.isArray(obj) ) {
      // this.logger.info(this, '[ array 입니다. ] : ', obj);
      tempLen = obj.length;

    } else if ( obj.constructor === Object ) {
      // this.logger.info(this, '[ object 입니다. ] : ', obj);
      tempLen = Object.keys(obj).length;
    }

    return tempLen;
  }

  public limitMinMax(num, min = 0, max = 100): any {
    if ( num < min ) {
      return min;
    }
    if ( num > max ) {
      return max;
    }
    return num;
  }

  public trimAll(str): any {
    if ( !str ) {
      return '';
    }
    return str.replace(/ /g, '');
  }
}

export default MytJoinInfoDiscount;
