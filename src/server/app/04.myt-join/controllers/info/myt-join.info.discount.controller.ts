/**
 * MenuName: 나의 가입정보 > 약정할인/기기상환 정보(MS_09)
 * @file myt-join.info.discount.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.04
 * Summary: 약정정보, 기기상환 정보 조회
 */

import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
// import { MYT_JOIN_CONTRACT_TERMINAL, TIME_UNIT } from '../../../../types/string.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import CommonHelper from '../../../../utils/common.helper';

/*
function titlePriceDC(feeType: string, start: any, end: any): string {
  // 반올림으로 기간(개월)을 계산
  const duration = Math.round(moment(end, 'YYYYMMDD').diff(start, 'months', true));
  return `${MYT_JOIN_CONTRACT_TERMINAL[feeType].TIT_NM}(${duration}${TIME_UNIT.MONTH})`;
}
*/

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

  get resDataInfo() {
    return this._resDataInfo;
  }

  set resDataInfo(value) {
    this._resDataInfo = value;
  }

  get commDataInfo() {
    return this._commDataInfo;
  }

  set commDataInfo(value) {
    this._commDataInfo = value;
  }

  /*
  // default: 'info/myt-join.info.discount.html'
  private _urltplinfo: any = {
    pagerenderview: 'info/myt-join.info.discount.html',
  };
  */

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._render(req, res, next, svcInfo, allSvc, childInfo, pageInfo);
  }

  _render(req, res, next, svcInfo, allSvc, child, pageInfo) {
    this._setDataInfo(req, svcInfo, pageInfo);
    const thisMain = this;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // this._typeInit();

    // 주의: API 버전 다운시 url 변경있음 -> 명세서 확인 필요
    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2), 'p1');
    // const p1 = this._getPromiseApiMock( contractTerminal_BFF_05_0063, 'p1' );

    Promise.all([p1]).then(function(resArr) {
      // thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView]', thisMain._urlTplInfo.pageRenderView);

      thisMain.resDataInfo = resArr[0].result;

      thisMain._dataInit();

      // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
      thisMain.renderView(res, 'info/myt-join.info.discount.html', {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        commDataInfo: thisMain.commDataInfo,
        resDataInfo: thisMain.resDataInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, '[ Promise.all > error ] : ', err);
      return thisMain.error.render(res, {
        // title: 'title',
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });
  }

  _setDataInfo(req, svcInfo, pageInfo) {
    this._svcInfo = svcInfo;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    CommonHelper.addCurLineInfo(svcInfo);
  }

  // NOTE: 안씀
  /*
  private _typeInit() {
    /!*
    * 타입별로 render html 정함.
    * M1.휴대폰
    * M3.포켓파이
    * M4.로그인
    * M5.와이브로
    * S1/S2/S3.인터넷/IPTV/집전화
    * O1.보안 솔루션
     *!/
    switch ( this._svcInfo.svcAttrCd ) {
      case 'M1':
        this.logger.info(this, '[ svcAttrCd : M1 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'info/myt-join.info.discount.html';
        break;
      case 'M3':
        this.logger.info(this, '[ svcAttrCd : M3 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.tpocketfi.html';
        break;
      case 'M5':
        this.logger.info(this, '[ svcAttrCd : M5 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.twibro.html';
        break;
      case 'M4':
        this.logger.info(this, '[ svcAttrCd : M4 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = 'join/myt.join.contract-terminal.tlogin.html';
        break;
      case 'S1':
      case 'S2':
      case 'S3':
        this.logger.info(this, '[ S1 / S2 / S3 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = '';
        break;
      case 'O1':
        this.logger.info(this, '[ O1 ] : ', this._svcInfo.svcAttrCd);
        this._urlTplInfo.pageRenderView = '';
        break;
    }
  }
  */

  /**
   * 데이터 조회 후 화면 출력을 위해 세팅
   * @private
   */
  _dataInit() {
    this.logger.info(this, '[ _dataInit() start ]');

    const thisMain = this;
    this.commDataInfo.feeInfo = [];
    this.commDataInfo.terminalInfo = [];
    this.commDataInfo.repaymentInfo = [];
    this.commDataInfo.tRental = null;

    const priceList = thisMain.resDataInfo.priceList;
    this.logger.info(this, '[ (priceList) ]', this.getSizeObjOrArr(priceList));

    const tAgree = thisMain.resDataInfo.tAgree;
    const tInstallment = thisMain.resDataInfo.tInstallment;
    const rsvPenTAgree = thisMain.resDataInfo.rsvPenTAgree;
    const sucesAgreeList = thisMain.resDataInfo.sucesAgreeList;
    this.logger.info(this, '[ (tAgree) ]', this.getSizeObjOrArr(tAgree));
    this.logger.info(this, '[ (tInstallment) ]', this.getSizeObjOrArr(tInstallment));
    this.logger.info(this, '[ (rsvPenTAgree) ]', this.getSizeObjOrArr(rsvPenTAgree));
    this.logger.info(this, '[ (sucesAgreeList) ]', this.getSizeObjOrArr(sucesAgreeList));
    this.logger.info(this, '[ (tRental) ]', this.getSizeObjOrArr(thisMain.resDataInfo.tRental));

    const installmentList = thisMain.resDataInfo.installmentList;
    this.logger.info(this, '[ (installmentList) ]', this.getSizeObjOrArr(installmentList));

    const tablet = thisMain.resDataInfo.tablet;
    const wibro = thisMain.resDataInfo.wibro;
    this.logger.info(this, '[ (tablet) ]', this.getSizeObjOrArr(tablet));
    this.logger.info(this, '[ (wibro) ]', this.getSizeObjOrArr(wibro));

    // -------------------------------------------------------------[1. 요금약정할인 정보]
    /*
    * 상품코드 분류(priceList.prodId)
    * 요금약정할인24 (730): NA00003677 | FEE_TYPE_A | 상세할인 내역보기
    * 테블릿 약정할인 12 (뉴태블릿약정): NA00003681 | FEE_TYPE_B | 상세할인 내역보기
    * 선택약정할인제도: NA00004430 | FEE_TYPE_E | 상세할인 내역보기
    * 2G전환요금할인(70%) (24개월(2G전환)): NA00006349 | FEE_TYPE_A | 상세할인 내역보기
    * 해당분류에 포함되지않는 경우: FEE_NOTYPE
    */

    if ( this.getSizeObjOrArr(priceList) > 0 ) {
      let priceItem;
      const count = priceList.length;
      for ( let i = 0; i < count; i++ ) {
        priceItem = priceList[i];
        switch ( priceItem.prodId ) {
          case 'NA00003677': // 요금약정할인24 (730)
            priceItem.typeStr = 'FEE_TYPE_A';
            // 사용 되지 않는 것으로 보임.
            // priceItem.titNm = titlePriceDC(priceItem.typeStr, priceItem.agrmtDcStaDt, priceItem.agrmtDcEndDt);
            priceItem.disProdNm2 = this.trimAll(priceItem.disProdNm);
            priceItem.disProdNm_N = '요금약정할인제도';
            break;
          case 'NA00003681': // 뉴태블릿약정
            priceItem.typeStr = 'FEE_TYPE_B';
            priceItem.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_B.TIT_NM;
            priceItem.disProdNm_N = 'LTE데이터약정할인제도';
            break;
          case 'NA00004430': // 선택약정할인
            priceItem.typeStr = 'FEE_TYPE_E';
            // 사용 되지 않는 것으로 보임.
            // priceItem.titNm = titlePriceDC(priceItem.typeStr, priceItem.agrmtDcStaDt, priceItem.agrmtDcEndDt);
            priceItem.disProdNm2 = this.trimAll(priceItem.disProdNm);
            priceItem.disProdNm_N = '선택약정할인제도';
            break;
          case 'NA00006349': // 2G전환요금할인(70%) (24개월(2G전환))
            priceItem.typeStr = 'FEE_TYPE_F';
            priceItem.disProdNm2 = this.trimAll(priceItem.disProdNm);
            priceItem.disProdNm_N = '2G전환요금할인';
            // priceItem.disProdNm2 = (priceItem.disProdNm || '').replace(/  /g, ' ');
            // priceItem.disProdNm2 = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_F.TIT_NM;
            break;
          default:
            priceItem.typeStr = 'FEE_NOTYPE';
            priceItem.titNm = priceItem.disProdNm; // 할인 상품명
            priceItem.disProdNm_N = priceItem.disProdNm;
            break;
        }
        priceItem.svcAgrmtDcObj = {
          svcAgrmtDcId : priceItem.svcAgrmtDcId || '',
          svcAgrmtDcCd : priceItem.svcAgrmtDcCd || ''
        };
        priceItem.salePay = FormatHelper.addComma(priceItem.agrmtDcAmt);
        thisMain._proDate(
          priceItem,
          priceItem.agrmtDcStaDt,
          priceItem.agrmtDcEndDt);
        thisMain.commDataInfo.feeInfo.push(priceItem);
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

      thisMain.commDataInfo.feeInfo.push(tablet);
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
    //   thisMain.commDataInfo.feeInfo.push(wibro);
    // }




    this.logger.info(this, '[ 1. this.commDataInfo.feeInfo ]');
    // console.dir(this.commDataInfo.feeInfo);

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

      thisMain.commDataInfo.terminalInfo.push(tAgree);
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
      thisMain.commDataInfo.terminalInfo.push(tInstallment);
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

      thisMain.commDataInfo.terminalInfo.push(rsvPenTAgree);
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

        thisMain.commDataInfo.terminalInfo.push(sucesAgreeList[i]);
      }
    }
    this.logger.info(this, '[ 2. this.commDataInfo.terminalInfo ]');
    // console.dir(this.commDataInfo.terminalInfo);

    // -------------------------------------------------------------[3. 단말기 분할 상환 정보]
    if ( this.getSizeObjOrArr(installmentList) > 0 ) {
      for ( let i = 0; i < installmentList.length; i++ ) {
        installmentList[i].titNm = installmentList[i].eqpMdlNmNonMask || installmentList[i].eqpMdlNm;

        installmentList[i].totSubsidy = FormatHelper.addComma(installmentList[i].allotApprAmt); // 총 할부지원금액
        installmentList[i].agreeClaimPay = FormatHelper.addComma(installmentList[i].invBamt); // 잔여할부청구금액

        const installmentListEndDt = moment(installmentList[i].allotStaDt).add(installmentList[i].allotMthCnt, 'months').format('YYYYMMDD');

        thisMain._proDateRemMt(
          installmentList[i],
          installmentList[i].allotStaDt, installmentListEndDt );

        // 분할상환금, 분할상환수수료
        installmentList[i].mthPrnAmt = FormatHelper.addComma(installmentList[i].mthprnAmt || '0');
        installmentList[i].mthIntAmt = FormatHelper.addComma(installmentList[i].mthintAmt || '0');
        const mthTotAmt = parseInt(installmentList[i].mthprnAmt || 0, 10) +
          parseInt(installmentList[i].mthintAmt || 0, 10)
        installmentList[i].mthTotAmt = FormatHelper.addComma(mthTotAmt.toString());

        // 중도부분납금, 중도부분납일
        installmentList[i].allotPayAmt = FormatHelper.addComma(installmentList[i].allotPayAmt || '0');
        installmentList[i].lastAllotPayOpTm
          = installmentList[i].lastAllotPayOpTm ? DateHelper.getShortDate(installmentList[i].lastAllotPayOpTm) : '-';

        thisMain.commDataInfo.repaymentInfo.push(installmentList[i]);
      }
    }
    this.logger.info(this, '[ 3. this.commDataInfo.repaymentInfo ]');
    // console.dir(this.commDataInfo.repaymentInfo);


    // 단말기 구매정보(T렌탈)
    if ( this.getSizeObjOrArr(thisMain.resDataInfo.tRental) > 0 ) {
      this.commDataInfo.tRental = thisMain.resDataInfo.tRental;
      this.commDataInfo.tRental.rentalStaDt = DateHelper.getShortDate(this.commDataInfo.tRental.rentalStaDt);
      this.commDataInfo.tRental.allotEndSchdDt = DateHelper.getShortDate(this.commDataInfo.tRental.allotEndSchdDt);
      this.commDataInfo.tRental.mthRentAmt = FormatHelper.addComma(this.commDataInfo.tRental.mthRentAmt);
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
    dataObj.curMt = DateHelper.getDiffByUnit(useDt, startDt, 'month'); // 진행 월수(회차표기를 하기 위해)
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수

    const nPerDt = Math.min(Math.floor((dataObj.curDt / dataObj.totDt) * 100));
    dataObj.nPerDt = nPerDt < 0 ? 0 : nPerDt > 100 ? 100 : nPerDt;
    dataObj.perDt = 100 - Math.floor((dataObj.curDt / dataObj.totDt) * 100); // 퍼센트(잔여일수에 대한..)
    dataObj.perDt = this.limitMinMax(dataObj.perDt, 0, 100);  // 퍼센트 min:0, max:100
    dataObj.totMt = Math.round(
      moment(endDt, 'YYYYMMDD').diff(startDt, 'months', true)
    );

    console.log( '[ _proDate ] stt:', startDt , ', end:', endDt
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
    const useDt = DateHelper.getCurrentShortDate(new Date()); // 진행날짜

    dataObj.startDt = DateHelper.getShortDate(startDt);
    dataObj.endDt = DateHelper.getShortDate(endDt);

    dataObj.totDt = DateHelper.getDiffByUnit(endDt, startDt, 'day') + 1;
    dataObj.curDt = DateHelper.getDiffByUnit(useDt, startDt, 'day');  // 진행 일수(첫날 미포함, 잔여일수 계산을 위해)
    dataObj.remDt = dataObj.totDt - dataObj.curDt; // 잔여일수
    dataObj.totMt = dataObj.allotMthCnt; // 전체 개월
    dataObj.curMt = dataObj.allotMthCnt - dataObj.invRmn; // 진행 개월
    dataObj.remMt = dataObj.invRmn; // 잔여 개월

    // 고도화 그래프 처리 방법 변경
    const nPerMt = Math.min(Math.floor((dataObj.curMt / dataObj.totMt) * 100));
    dataObj.nPerMt = nPerMt < 0 ? 0 : nPerMt > 100 ? 100 : nPerMt;
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
