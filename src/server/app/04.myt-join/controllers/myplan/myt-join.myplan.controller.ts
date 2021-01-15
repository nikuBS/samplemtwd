/**
 * MyT > 나의 가입정보 > 나의 요금제/부가상품
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-09-19
 */
// import moment from 'moment';
import {Observable} from 'rxjs/Observable';
// import { map, mergeMap, switchMap } from 'rxjs/operators';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE /* , API_VERSION */} from '../../../../types/api-command.type';
import {SVC_CDNAME, /* SVC_CDGROUP, */ PRODUCT_CALLPLAN /* , SVC_ATTR_NAME, VOICE_UNIT */} from '../../../../types/bff.type';
import {
  DATA_UNIT, MYT_FEEPLAN_BENEFIT, FEE_PLAN_TIP_TXT, CURRENCY_UNIT /* , MYT_JOIN_CONTRACT_TERMINAL, UNIT */
} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';
import CommonHelper from '../../../../utils/common.helper';
import { /* MYT_FARE_SUBMAIN_TITLE, */ MYT_JOIN_MYPLAN_TITLE} from '../../../../types/title.type';
// import StringHelper from '../../../../utils/string.helper';

/* 상품 카테고리 별 툴팁 코드 목록 */
const FEE_PLAN_TIP = {
  M1: ['MS_05_tip_01'], // 휴대폰
  M2: ['MS_05_tip_02'], // 선불폰(PPS)
  M3: ['MS_05_tip_04'], // T pocket Fi
  M4: ['MS_05_tip_04'], // T Login
  M5: [], // T Wibro
  S1: ['MS_05_tip_03'], // 인터넷
  S2: ['MS_05_tip_03'], // IPTV
  S3: ['MS_05_tip_03'] // 집전화
};

/*
const compare = (a, b) => {
  const codeA = a.svcAttrCd.toUpperCase();
  const codeB = b.svcAttrCd.toUpperCase();

  let comparison = 0;
  if ( codeA > codeB ) {
    comparison = 1;
  } else if ( codeA < codeB ) {
    comparison = -1;
  }
  return comparison;
};
*/

/**
 * 다른 회선 항목 정리
 * @param target
 * @param items
 */
/*
const convertOtherLines = (target, items): any => {
  const list: any = [];
  if (items) {
    const mobile = (items['m'] || []).sort(compare);
    const spc = (items['s'] || []).sort(compare);
    const other = (items['o'] || []).sort(compare);
    [...mobile, ...spc, ...other].filter((item) => {
      if (target.svcMgmtNum !== item.svcMgmtNum) {
        // PPS, 휴대폰이 아닌 경우는 서비스명 노출
        if (['M1', 'M2'].indexOf(item.svcAttrCd) === -1) {
          item.nickNm = SVC_ATTR_NAME[item.svcAttrCd];
        } else {
          // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
          // item.nickNm = item.nickNm || item.eqpMdlNm;
          item.nickNm = item.nickNm || SVC_ATTR_NAME[item.svcAttrCd];
        }
        // IPTV, 인터넷 인 경우 주소표시
        if (['S1', 'S2'].indexOf(item.svcAttrCd) > -1) {
          item.svcNum = item.addr;
        } else {
          item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
        }
        list.push(item);
      }
    });
  }
  return list;
};
*/

/*
const parseNumber = (str: string, abs: boolean = false): number => {
  if (!str) {
    return 0;
  }
  const result = parseInt(str.replace(/,/g, ''), 10);
  if (abs) {
    return Math.abs(result);
  }
  return result;
};
*/

/**
 * 혜택 값이 높은 순으로 정렬
 * @param list - 옵션 및 할인 프로그램 목록
 */
const sortByHigher = (list: Array<any>): Array<any> =>
  list.sort((itemA, itemB) => (itemA.dcVal > itemB.dcVal) ? -1 : (itemA.dcVal < itemB.dcVal) ? 1 : 0);

// -------------------------------------------------------------[COM]
/*
const getSize = (obj: any): number => {
  if (!obj) {
    return -1;
  }
  if (Array.isArray(obj)) {
    // this.logger.info(this, '[ array 입니다. ] : ', obj);
    return obj.length;
  }
  if (obj.constructor === Object) {
    // this.logger.info(this, '[ object 입니다. ] : ', obj);
    return Object.keys(obj).length;
  }
  return 0;
};
*/

/*
const trimAll = (str: string): string => {
  if (!str) {
    return '';
  }
  return str.replace(/ /g, '');
};
*/

/*
const limitMinMax = (num: number, min: number = 0, max: number = 100): number => {
  if (num < min) {
    return min;
  }
  if (num > max) {
    return max;
  }
  return num;
};
*/

/**
 * @desc 부가서비스 BFF 데이터 가공
 */
const convertAdditionData = (addition: any): any => {
  return {
    ...addition,
    basFeeTxt: FormatHelper.getFeeContents(addition.basFeeTxt),
    isNotFree: addition.payFreeYn === 'N' || addition.payFreeYn === 'Y' && PRODUCT_CALLPLAN.SEE_CONTENTS.includes(addition.basFeeTxt),
    scrbDt: DateHelper.getShortDate(addition.scrbDt) // 신청일
  };
};

/**
 * @desc 등록일 오름차순으로 보이도록 설정
 */
const sortByScrbDt = (a: any, b: any): number => {
  const diff = DateHelper.getDifference(a.scrbDt, b.scrbDt);
  if (diff > 0) {
    return 1;
  }
  if (diff < 0) {
    return -1;
  }
  return 0;
};

/**
 * 데이터 값 분기 처리
 * @param basDataGbTxt - 기가 값
 * @param basDataMbTxt - 메가 값
 */
const _convertBasDataTxt = (basDataGbTxt: any, basDataMbTxt: any): any => {
  if (!FormatHelper.isEmpty(basDataGbTxt)) {  // Gb 값 우선 사용
    return {
      txt: basDataGbTxt,
      unit: DATA_UNIT.GB
    };
  }

  if (!FormatHelper.isEmpty(basDataMbTxt)) {  // Gb 없고 Mb 있으면 값 사용
    return {
      txt: basDataMbTxt,
      unit: DATA_UNIT.MB
    };
  }

  return {
    txt: null,
    unit: null
  };
};

/**
 * 날짜계산 (날짜계산은 첫날을 포함해서 계산 - 이진영수석, 김용혁 매니저와 legacy 확인 후 협의 정리된 내용(2019.02.28))
 * @param dataObj 계산된 날짜 넣을 object
 * @param start - 시작일자
 * @param end - 종료일자
 * @param remnant - 남은일수
 * @private
 */
// const _proDate = (dataObj: any, start: string, end: string, remnant: any = null) => {
/*
const _proDate = (dataObj: any, start: string, end: string) => {
  // this.logger.info(this, '[ _proDate ] param stt:', start, ', end:', end, ', rem:', remnant);
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
  dataObj.perDt = limitMinMax(dataObj.perDt, 0, 100);  // 퍼센트 min:0, max:100
  dataObj.totMt = Math.round(
    moment(endDt, 'YYYYMMDD').diff(startDt, 'months', true)
  );

  /!*
  this.logger.info(this, '[ _proDate ] stt:', startDt , ', end:', endDt
      , ', tot:', dataObj.totDt, ', ing:', dataObj.curDt, ', rem:' + dataObj.remDt
      , ', per(rem):' + dataObj.perDt, ', totMt:' + dataObj.totMt);
  *!/
};
*/

/**
 * 잔여 개월수 계산
 * @param {Object} dataObj
 * @param {String} start
 * @param {String} end
 */
/*
const _proDateRemMt = (dataObj: any, start: string, end: string) => {
  const startDt = start;
  const endDt = end;

  dataObj.startDt = DateHelper.getShortDate(startDt);
  dataObj.endDt = DateHelper.getShortDate(endDt);

  dataObj.totMt = dataObj.allotMthCnt; // 전체 개월
  dataObj.curMt = dataObj.allotMthCnt - dataObj.invRmn; // 진행 개월
  dataObj.remMt = dataObj.invRmn; // 잔여 개월

  dataObj.perMt = 100 - Math.floor((dataObj.curMt / dataObj.totMt) * 100); // 퍼센트
  dataObj.perMt = limitMinMax(dataObj.perMt, 0, 100);
};
*/

/*
// NOTE: src/server/app/04.myt-join/controllers/info
// 약정할인/기기상환정보
const _convertFeeAgreementInfo = (priceList: Array<any>, tablet: any /!*, wibro: any *!/) => {
  // const priceList = this._resDataInfo.priceList;
  const feeInfo: Array<any> = [];
  // -------------------------------------------------------------[1. 요금약정할인 정보]
  /!*
  * 상품코드 분류(priceList.prodId)
  * 요금약정할인24 (730): NA00003677 | FEE_TYPE_A | 상세할인 내역보기
  * 테블릿 약정할인 12 (뉴태블릿약정): NA00003681 | FEE_TYPE_B | 상세할인 내역보기
  * 선택약정할인제도: NA00004430 | FEE_TYPE_E | 상세할인 내역보기
  * 2G전환요금할인(70%) (24개월(2G전환)): NA00006349 | FEE_TYPE_A | 상세할인 내역보기
  * 해당분류에 포함되지않는 경우: FEE_NOTYPE
  *!/

  if ( getSize(priceList) > 0 ) {
    let priceItem;
    const count = priceList.length;
    for ( let i = 0; i < count; i++ ) {
      priceItem = priceList[i];
      switch ( priceItem.prodId ) {
        case 'NA00003677': // 요금약정할인24 (730)
          priceItem.typeStr = 'FEE_TYPE_A';
          // 사용 되지 않는 것으로 보임.
          // priceItem.titNm = titlePriceDC(priceItem.typeStr, priceItem.agrmtDcStaDt, priceItem.agrmtDcEndDt);
          priceItem.disProdNm2 = trimAll(priceItem.disProdNm);
          break;
        case 'NA00003681': // 뉴태블릿약정
          priceItem.typeStr = 'FEE_TYPE_B';
          priceItem.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_B.TIT_NM;
          break;
        case 'NA00004430': // 선택약정할인
          priceItem.typeStr = 'FEE_TYPE_E';
          // 사용 되지 않는 것으로 보임.
          // priceItem.titNm = titlePriceDC(priceItem.typeStr, priceItem.agrmtDcStaDt, priceItem.agrmtDcEndDt);
          priceItem.disProdNm2 = trimAll(priceItem.disProdNm);
          break;
        case 'NA00006349': // 2G전환요금할인(70%) (24개월(2G전환))
          priceItem.typeStr = 'FEE_TYPE_F';
          priceItem.disProdNm2 = trimAll(priceItem.disProdNm);
          // priceItem.disProdNm2 = (priceItem.disProdNm || '').replace(/  /g, ' ');
          // priceItem.disProdNm2 = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_F.TIT_NM;
          break;
        default:
          priceItem.typeStr = 'FEE_NOTYPE';
          priceItem.titNm = priceItem.disProdNm; // 할인 상품명
          break;
      }
      priceItem.svcAgrmtDcObj = {
        svcAgrmtDcId : priceItem.svcAgrmtDcId || '',
        svcAgrmtDcCd : priceItem.svcAgrmtDcCd || ''
      };
      priceItem.salePay = FormatHelper.addComma(priceItem.agrmtDcAmt);
      _proDate(
        priceItem,
        priceItem.agrmtDcStaDt,
        priceItem.agrmtDcEndDt);
      feeInfo.push(priceItem);
    }
  }

  // 테블릿
  if ( getSize(tablet) > 0 ) {

    tablet.typeStr = 'fee_noType';
    tablet.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_C.TIT_NM;
    tablet.agrmtDcAmt = FormatHelper.addComma(tablet.agrmtDcAmt);
    tablet.agrmtDayCnt = FormatHelper.addComma(tablet.agrmtDayCnt);
    tablet.aGrmtPenAmt = FormatHelper.addComma(tablet.aGrmtPenAmt);
    _proDate(
      tablet,
      tablet.agrmtDcStaDt,
      tablet.agrmtDcEndDt);

    feeInfo.push(tablet);
  }

  // 와이브로
  /!*
  if ( getSize(wibro) > 0 ) {

    wibro.typeStr = 'fee_noType';
    wibro.titNm = MYT_JOIN_CONTRACT_TERMINAL.FEE_TYPE_D.TIT_NM;
    wibro.agrmtDcAmt = FormatHelper.addComma(tablet.agrmtDcAmt);
    wibro.agrmtDayCnt = FormatHelper.addComma(tablet.agrmtDayCnt);
    wibro.aGrmtPenAmt = FormatHelper.addComma(tablet.aGrmtPenAmt);
    _proDate(
      wibro,
      wibro.agrmtDcStaDt,
      wibro.agrmtDcEndDt);

    feeInfo.push(wibro);
  }
  *!/

  return feeInfo;
};

// 단말기 약정할인 정보
const _convertTerminalAgreementInfo = (tAgree: any, rsvPenTAgree: any, tInstallment: any, sucesAgreeList: Array<any>) => {
  const terminalInfo: Array<any> = [];

  // -------------------------------------------------------------[2. 단말기 약정할인 정보]
  if ( getSize(tAgree) > 0 ) {

    /!*
    *  T 기본약정 분류(tAgree.agrmtDivision)
    *  가입/T지원금약정 : 'TSupportAgree' | join_type_B
    *  가입/T약정할부지원 : tInstallment 객체로 구분 | join_type_C
    *  가입/약정위약금2 : rsvPenTAgree 객체로 구분 | join_type_D
    *  해당분류에 포함되지않는 경우 | join_noType
     *!/

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
    _proDate(
      tAgree,
      tAgree.staDt,
      tAgree.agrmtTermDt,
      tAgree.rmnDayCnt );

    terminalInfo.push(tAgree);
  }

  if ( getSize(tInstallment) > 0 ) { // T약정 할부지원
    tInstallment.typeStr = 'join_type_C';
    tInstallment.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.TITNM;
    tInstallment.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM;

    // 약정 위약금2와 함께 가입한 경우 상품명 변경
    if ( getSize(rsvPenTAgree) > 0 ) {
      tInstallment.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.TITNM2;
      tInstallment.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_C.AGREE_NM2;
    }

    tInstallment.agreeTotMonth = tInstallment.allotMthCnt; // 약정 전체 개월수
    tInstallment.agreePay = FormatHelper.addComma(tInstallment.totAgrmtAmt); // 약정 금액
    tInstallment.penalty = FormatHelper.addComma(tInstallment.penAmt2); // 위약금
    const tInstallmentEndDt = moment(tInstallment.tInstallmentOpDt).add(tInstallment.allotMthCnt, 'months').format('YYYYMMDD');
    _proDate(tInstallment, tInstallment.tInstallmentOpDt, tInstallmentEndDt);
    terminalInfo.push(tInstallment);
  }

  if ( getSize(rsvPenTAgree) > 0 ) { // 약정 위약금2
    rsvPenTAgree.typeStr = 'join_type_D';
    rsvPenTAgree.titNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.TITNM;
    rsvPenTAgree.agreeNm = MYT_JOIN_CONTRACT_TERMINAL.JOIN_TYPE_D.AGREE_NM;

    rsvPenTAgree.agreeTotMonth = rsvPenTAgree.rtenAgrmtMthCnt; // 약정 전체 개월수
    rsvPenTAgree.agreePay = FormatHelper.addComma(rsvPenTAgree.rtenPenStrdAmt); // 약정 금액
    rsvPenTAgree.penalty = FormatHelper.addComma(rsvPenTAgree.rsvPenAmt); // 위약금

    _proDate(
      rsvPenTAgree,
      rsvPenTAgree.astamtOpDt,
      rsvPenTAgree.rtenAgrmtEndDt,
      rsvPenTAgree.remDayCnt );

    terminalInfo.push(rsvPenTAgree);
  }

  if ( getSize(sucesAgreeList) > 0 ) { // 단말기 승계 정보

    for ( let i = 0; i < sucesAgreeList.length; i++ ) {
      /!*
      * T 기본약정 분류(sucesAgreeList.bfEqpDcClCd)
      * 승계/T약정 할부지원 : '1' | suc_type_A
      * 승계/T기본약정 : '2' | suc_type_B
      * 승계/약정위약금2 : '3' | suc_type_C
      * 승계/T지원금약정 : '7' | suc_type_D
      * 해당분류에 포함되지않는 경우 | suc_noType
       *!/
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

      _proDate(sucesAgreeList[i],
        sucesAgreeList[i].sucesAgrmtStaDt,
        sucesAgreeList[i].sucesAgrmtEndDt,
        sucesAgreeList[i].sucesRemDayCnt);

      terminalInfo.push(sucesAgreeList[i]);
    }
  }

  return terminalInfo;
};

// 단말기 분할 상환 정보
const _convertRepaymentAgreementInfo = (installmentList: Array<any>) => {
  const repaymentInfo: Array<any> = [];

  // -------------------------------------------------------------[3. 단말기 분할 상환 정보]
  if ( getSize(installmentList) > 0 ) {
    for ( let i = 0; i < installmentList.length; i++ ) {
      installmentList[i].titNm = installmentList[i].eqpMdlNm;

      installmentList[i].totSubsidy = FormatHelper.addComma(installmentList[i].allotApprAmt); // 총 할부지원금액
      installmentList[i].agreeClaimPay = FormatHelper.addComma(installmentList[i].invBamt); // 잔여할부청구금액

      const installmentListEndDt = moment(installmentList[i].allotStaDt).add(installmentList[i].allotMthCnt, 'months').format('YYYYMMDD');

      _proDateRemMt(
        installmentList[i],
        installmentList[i].allotStaDt, installmentListEndDt );

      // 분할상환금, 분할상환수수료
      installmentList[i].mthPrnAmt = FormatHelper.addComma(installmentList[i].mthprnAmt || '0');
      installmentList[i].mthIntAmt = FormatHelper.addComma(installmentList[i].mthintAmt || '0');

      // 중도부분납금, 중도부분납일
      installmentList[i].allotPayAmt = FormatHelper.addComma(installmentList[i].allotPayAmt || '0');
      installmentList[i].lastAllotPayOpTm
        = installmentList[i].lastAllotPayOpTm ? DateHelper.getShortDate(installmentList[i].lastAllotPayOpTm) : '-';

      repaymentInfo.push(installmentList[i]);
    }
  }

  return repaymentInfo;
};

// // 단말기 구매정보(T렌탈)
const _convertTRentalAgreementInfo = (tRental: any): any => {
  // 단말기 구매정보(T렌탈)
  if (getSize(tRental) > 0) {
    const rentalInfo = tRental;
    rentalInfo.rentalStaDt = DateHelper.getShortDate(tRental.rentalStaDt);
    rentalInfo.allotEndSchdDt = DateHelper.getShortDate(tRental.allotEndSchdDt);
    rentalInfo.mthRentAmt = FormatHelper.addComma(tRental.mthRentAmt);
    return rentalInfo;
  }

  return {};
};
*/

/**
 * @class
 */
class MyTJoinMyplan extends TwViewController {
  private _svcType: number = 0; // 기본 모바일, 모르면 모바일임
  private _isWireless: boolean = true;

  /**
   * 회선 타입 구분
   * @param {Object} svcInfo
   * @param {String} svcInfo.svcAttrCd
   * @private
   */
  private setSvcType(svcInfo: any): void {
    switch (svcInfo.svcAttrCd) {
      case 'M1': // 모바일
        this._isWireless = true;
        this._svcType = 0;
        break;
      case 'M2': // PPS
        this._isWireless = true;
        this._svcType = 1;
        break;
      case 'M3': // T Pocket-Fi
      case 'M4': // T Login
        this._isWireless = true;
        this._svcType = 2;
        break;
      case 'M5': // T-WiBro
        this._isWireless = true;
        this._svcType = 3;
        break;
      case 'S1': // 인터넷
      case 'S2': // IPTV
      case 'S3': // 집전화
        // 유선
        this._isWireless = false;
        this._svcType = 4;
        break;
      default: // 오류
        this._svcType = -1;
        break;
    }
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setSvcType(svcInfo);
    // 회선선택 영역
    CommonHelper.addCurLineInfo(svcInfo);

    const defaultOptions = {
      title: MYT_JOIN_MYPLAN_TITLE.MAIN,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    };

    // 사용자 회선값(svcAttrCd) 없을 경우 오류 처리
    if (this._svcType === -1) {
      return this.error.render(res, defaultOptions);
    }

    Observable.combineLatest(
      this._getFeePlan(), // 요금제
      this._getAdditions(svcInfo), // 부가상품
      this._getBenefits(svcInfo), // 혜택/할인
      this._getCombinations() // 나의 결합 상품 건수
      // TODO: 성능 문제로 배포 연기
      /*
      this._getAgreements(),// 약정할인/기기상환정보
      this._getFee(svcInfo, childInfo, allSvc), // 이번 달 청구/이용 요금
      this._getUsagePattern(),
      this._getPPS()
      */
    ).subscribe((subscriptions: Array<any>) => {
      const apiError = subscriptions.find(subscription => (subscription && !!subscription.code && subscription.code !== '00'));
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(defaultOptions, apiError));
      }
      // TODO: 성능 문제로 배포 연기
      const [feePlan, additions, benefits, combinations /* , agreements, fee, usagePattern, pps */] = subscriptions;

      // 컨버팅 결과 값이 없을 시 오류 처리
      if (FormatHelper.isEmpty(feePlan)) {
        return this.error.render(res, defaultOptions);
      }

      if (!this._isWireless) {
        additions.dcBenefits = feePlan.dcBenefits;
        delete feePlan.dcBenefits;
      }

      const tipList = this._getTipList(svcInfo.svcAttrCd);  // 회선 카테고리 값을 기준으로 툴팁 목록 가져오기

      res.render('myplan/myt-join.myplan.html', {
        pageInfo, // 페이지 정보
        svcInfo, // 사용자 정보
        svcCdName: SVC_CDNAME,  // 회선 카테고리 명
        templateType: this._isWireless ? 'wireless' : 'wire',  // 회선 별 렌더링 파일 명
        feePlan, // 요금제
        additions, // 부가 상품
        benefits, // 혜택/할인 (Mobile/T-Pocket-Fi/T-Login)
        combinations, // 나의 결합 상품 건수
        // TODO: 성능 문제로 배포 연기
        /*
        agreements, // 약정할인/기기상환정보
        fee, // 이번 달 청구/이용 요금
        usagePattern, // 최근 3개월 평균 사용량
        pps, // PPS 요금 안내
        */
        tipList, // 화면 별 툴팁 목록
        isFeeAlarm: ['cellphone', 'pps'].indexOf(SVC_CDNAME[svcInfo.svcAttrCd]) !== -1  // 요금제 변경 알람 서비스 제공을 위한 boolean
      });
    });
  }

  /**
   * 무선 데이터 변환
   * @param data - 무선 요금제 데이터
   */
  private _convertWirelessPlan(data): any {
    if (FormatHelper.isEmpty(data.feePlanProd)) {
      return null;
    }
    // 금액, 음성, 문자, 할인상품 값 체크
    const basFeeTxt = FormatHelper.getValidVars(data.feePlanProd.basFeeTxt);
    const basOfrVcallTmsCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrVcallTmsTxt);
    const basOfrCharCntCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrLtrAmtTxt);
    // const disProdList = FormatHelper.getValidVars(data.disProdList, []);
    // 데이터 값 변환
    const basDataGbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataGbTxt);
    const basDataMbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataMbTxt);
    const basDataTxt = _convertBasDataTxt(basDataGbTxt, basDataMbTxt);
    // 상품 스펙 공통 헬퍼 사용하여 컨버팅
    const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);
    return {
      // ...data,
      product: FormatHelper.isEmpty(data.feePlanProd) ? null : {
        ...data.feePlanProd,
        scrbDt: DateHelper.getShortDateWithFormat(data.feePlanProd.scrbDt, 'YYYY.M.D.'),  // 가입일
        basFeeInfo: spec.basFeeInfo,  // 금액
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
        basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
        btnList: this._convertBtnList(data.feePlanProd.btnList, data.feePlanProd.prodSetYn) // 버튼 목록
      },
      // TODO: 제거하고 BFF_05_0222로 사용해야 함
      // dcPrograms: this._convertWirelessDcPrograms(disProdList) // 옵션 및 할인 프로그램
    };
  }

  /**
   * 유선 값 변환
   * @param {Object} data - 유선 요금제 정보
   * @return {Object}
   */
  private _convertWirePlan(data): any {
    const isBasFeeAmtNumber = !isNaN(Number(data.basFeeAmt)); // 금액 숫자 여부
    return {
      product: {
        ...data,
        basFeeAmt: isBasFeeAmtNumber && parseInt(data.basFeeAmt, 10) > 0 ?
          FormatHelper.addComma(data.basFeeAmt.toString()) + CURRENCY_UNIT.WON : 0, // 금액 값 단위 붙여서 제공
        scrbDt: DateHelper.getShortDateWithFormat(data.svcScrbDt, 'YYYY.M.D.') // 신청일
      },
      dcBenefits: this._convertWireDcBenefits(data.dcBenefits)  // 혜택 값 변환
    };
  }

  /**
   * 툴팁 목록 가져오기
   * @param {String} svcAttrCd - 회선 카테고리 값
   */
  private _getTipList(svcAttrCd: string): any {
    if (FormatHelper.isEmpty(svcAttrCd)) {
      return [];
    }

    return FEE_PLAN_TIP[svcAttrCd].map((item) => {
      return {
        code: item,
        title: FEE_PLAN_TIP_TXT[item]
      };
    });
  }

  /**
   * 유선 무료 할인 혜택 데이터 변환
   * @param {Array<Object>} dcBenefits - 유선 무료 할인 혜택 데이터 값
   * @return {Array<Object>}
   */
  private _convertWireDcBenefits(dcBenefits: Array<any>): Array<any> {
    const dcTypeMoneyList: Array<any> = [];
    const dcTypePercentList: Array<any> = [];

    // 할인 값 단위 형태에 따라 목록 나눔 (원, %)
    dcBenefits.forEach((benefit) => {
      if (benefit.dcCttClCd === '01') {
        dcTypeMoneyList.push(benefit);
        return true;
      }

      dcTypePercentList.push(benefit);
    });

    // 원단위 높은값 목록 + 퍼센트 높은값 목록을 변환하여 반환
    return [...sortByHigher(dcTypeMoneyList), ...sortByHigher(dcTypePercentList)]
      .map(benefit => {
        benefit.penText = (benefit.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N; // 위약금 여부
        benefit.dcStaDt = DateHelper.getShortDateWithFormat(benefit.dcStaDt, 'YYYY.M.D.'); // 할인기간 (시작)
        benefit.dcEndDt = (benefit.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(benefit.dcEndDt, 'YYYY.M.D.')
          : MYT_FEEPLAN_BENEFIT.ENDLESS;  // 할인기간 (끝)
        benefit.dcVal = benefit.dcCttClCd === '01' ? FormatHelper.addComma(benefit.dcVal.toString()) : benefit.dcVal; // 할인 값
        return benefit;
      });
  }

  /**
   * 버튼 목록 컨버팅
   * @param {Array<Object>} btnList - 버튼 목록
   * @param {String} prodSetYn - 해당 상품의 설정 허용 여부
   */
  private _convertBtnList(btnList: Array<any>, prodSetYn: string): Array<any> {
    if (FormatHelper.isEmpty(btnList) || prodSetYn !== 'Y') {
      return [];
    }

    const settingBtnList: any = [];

    btnList.forEach((item) => {
      if (item.btnTypCd !== 'SE') { // 설정 외 버튼은 노출되지 않도록 처리 (by 기획 요건)
        return true;
      }

      settingBtnList.push(item);
    });

    return settingBtnList;
  }

  /*
  // 약정할인/기기상환정보
  private _getAgreements(): Observable<any> {
    if (this._svcType === 0 || this._svcType === 2) {
      return this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const data = resp.result;
          return {
            // 요금 약정 할인
            fees: _convertFeeAgreementInfo(data.priceList, data.tablet),
            // 단말기(약정할인)
            terminal: _convertTerminalAgreementInfo(data.tAgree, data.rsvPenTAgree, data.tInstallment,
              data.sucesAgreeList),
            // 단말기 분할상환 정보
            repayment: _convertRepaymentAgreementInfo(data.installmentList),
            // 단말기 구매정보(T렌탈)
            tRental: _convertTRentalAgreementInfo(data.tRental)
          };
        }
        // error
        return resp;
      });
    }
    return Observable.of(null);
  }

  // 혜택/할인: 요금 할인 (bill-discounts)
  private _getBillBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0106, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 결합할인 (combination-discounts)
  private _getCombinationBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0094, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 장기가입혜택 (loyalty-benefits)
  private _getLoyaltyBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0196, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 리필쿠폰 내역 (refill-coupons)
  private _getRefillCoupons(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }
  */

  // 혜택/할인
  // XXX: svcInfo의 type이 정해진 적 없음
  private _getBenefits(svcInfo: any): Observable<any> {
    if (this._svcType === 0 || this._svcType === 2) {
      return this.apiService.request(API_CMD.BFF_05_0230, {
        svcMgmtNum: svcInfo.svcMgmtNum,
        svcNum: svcInfo.svcNum
      }).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const data = resp.result;
          const benefits: any = {
            count: 0
          };
          const billList = data.priceAgrmtList.filter(item =>
            (item.prodId !== data.clubCd || item.prodId !== data.tplusCd || item.prodId !== data.chucchucCd));
          // 요금할인
          if (billList.length > 0) {
            benefits.bill = {
              total: billList.length,
              item: billList[0].prodNm
            };
            benefits.count += billList.length;
          }
          // club상품
          if (data.clubYN) {
            benefits.club = {
              name: data.clubNm
            };
            benefits.count += 1;
          }
          // 척척 할인
          if (data.chucchuc) {
            benefits.goodDiscount = true;
            benefits.count += 1;
          }
          // T끼리 Plus 상품
          if (data.tplus) {
            benefits.tplus = true;
            benefits.count += 1;
          }
          // 데이터 선물하기
          if (data.dataGiftYN) {
            benefits.dataGift = true;
            benefits.count += 1;
          }
          // 특화혜택
          if (data.thigh5 || data.kdbthigh5) {
            const thighCount = (data.thigh5 && data.kdbthigh5) ? 2 : 1;
            benefits.special = {thighCount};
            benefits.count += thighCount;
          }
          // 요금할인- 복지고객
          if (data.wlfCustDcList && data.wlfCustDcList.length > 0) {
            benefits.welfare = true;
            benefits.count += data.wlfCustDcList.length;
          }
          // 결합할인
          if (data.combYn === 'Y') {
            if (data.prodNm.trim().length > 0) {
              /*
              const bond = {
                name: data.prodNm,
                total: parseInt(data.etcCnt, 10) + 1
              };
              benefits.count += bond.total;
              */
              benefits.count += parseInt(data.etcCnt, 10) + 1;
            }
          }
          // 데이터 쿠폰
          if (data.benfList.length > 0 && data.benfList.findIndex((item) => (item.benfCd === '1')) > -1) {
            benefits.coupons = data.refillCoupons.length;
            benefits.count += 1;
          }
          // 장기가입 요금
          if (data.longjoin) {
            // 장기요금할인 복수개 가능여부 확인 필요
            benefits.loyalty = true;
            benefits.count += data.dcList.length;
          }
          return benefits;
        }
        // error
        return resp;
      });
      /*
      return Observable.combineLatest(
        this._getBillBenefits(),
        this._getCombinationBenefits(),
        this._getLoyaltyBenefits(),
        this._getRefillCoupons()
      ).pipe(
        switchMap((subscriptions: Array<any>) => {
          const apiError = subscriptions.find(subscription => (subscription && !!subscription.code && subscription.code !== '00'));
          if (!FormatHelper.isEmpty(apiError)) {
            return Observable.of({
              msg: apiError.msg,
              code: apiError.code
            });
          }
          const [bill, combination, loyalty, refillCoupons] = subscriptions;
          const benefits: any = {
            count: 0
          };
          const billList = bill.priceAgrmtList.filter(item =>
            (item.prodId !== bill.clubCd || item.prodId !== bill.tplusCd || item.prodId !== bill.chucchucCd));
          // 요금할인
          if (billList.length > 0) {
            benefits.bill = {
              total: billList.length,
              item: billList[0].prodNm
            };
            benefits.count += billList.length;
          }
          // club상품
          if (bill.clubYN) {
            benefits.club = {
              name: bill.clubNm
            };
            benefits.count += 1;
          }
          // 척척 할인
          if (bill.chucchuc) {
            benefits.goodDiscount = true;
            benefits.count += 1;
          }
          // T끼리 Plus 상품
          if (bill.tplus) {
            benefits.tplus = true;
            benefits.count += 1;
          }
          // 데이터 선물하기
          if (bill.dataGiftYN) {
            benefits.dataGift = true;
            benefits.count += 1;
          }
          // 특화혜택
          if (bill.thigh5 || bill.kdbthigh5) {
            const thighCount = (bill.thigh5 && bill.kdbthigh5) ? 2 : 1;
            benefits.special = {thighCount};
            benefits.count += thighCount;
          }
          // 요금할인- 복지고객
          if (bill.wlfCustDcList && bill.wlfCustDcList.length > 0) {
            benefits.welfare = true;
            benefits.count += bill.wlfCustDcList.length;
          }
          // 결합할인
          if (combination.prodNm.trim().length > 0) {
            combination.bond = {
              name: combination.prodNm,
              total: parseInt(combination.etcCnt, 10) + 1
            };
            benefits.count += combination.bond.total;
          }
          // 데이터 쿠폰
          if (loyalty.benfList.length > 0 && loyalty.benfList.findIndex((item) => (item.benfCd === '1')) > -1) {
            benefits.coupons = refillCoupons.length;
            benefits.count += 1;
          }
          // 장기가입 요금
          if (bill.longjoin) {
            // 장기요금할인 복수개 가능여부 확인 필요
            benefits.loyalty = true;
            benefits.count += loyalty.dcList.length;
          }
          return Observable.of(benefits);
        })
      );
      */
    }
    return Observable.of(null);
  }

  // 나의 부가 상품
  private _getFeePlan(): Observable<any> { // command: any): Observable<any> {
    const self = this;
    let command;
    if (this._isWireless) {
      // 무선
      command = API_CMD.BFF_05_0136;
    } else {
      // 유선
      command = API_CMD.BFF_05_0128;
    }
    return this.apiService.request(command, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        let data;
        if (self._isWireless) {
          data = self._convertWirelessPlan(resp.result);
        } else {
          data = self._convertWirePlan(resp.result);
        }
        return data;
      }
      // error
      return resp;
    });
  }

  private _getAdditions(svcInfo: any): Observable<any> {
    // 무선 부가서비스 가져오기
    if (this._isWireless) {
      return this._getWirelessAdditions(svcInfo);
    }
    // 유선 부가서비스 가져오기
    return this._getWireAdditions();
  }

  private _getWirelessAdditions(svcInfo: any): Observable<any> {
    return Observable.zip(
      this.apiService.request(API_CMD.BFF_05_0222, {}),
      this.apiService.request(API_CMD.BFF_10_0185, {}, {
        svcMgmtNum: svcInfo.svcMgmtNum,
        svcNum: svcInfo.svcNum,
        custNum: svcInfo.custNum
      }),
      (...resps) => {
        const apiError = resps.find(resp => (resp && !!resp.code && resp.code !== '00'));
        if (!FormatHelper.isEmpty(apiError)) {
          return {
            msg: apiError.msg,
            code: apiError.code
          };
        }
        const [additionProds = {}, smartCallPickProds] = resps.map(resp => resp.result);
        let joinedPaid = (additionProds.addProdPayList || []).map(convertAdditionData);
        let joinedFree = (additionProds.addProdFreeList || []).map(convertAdditionData);
        // 가입된 로밍 요금제가 있을 경우
        const roaming = additionProds.roamingProd ? {
            ...additionProds.roamingProd,
            addRoamingProdCnt: additionProds.roamingProd.recentlyJoinsProdNm ?
              Number(additionProds.roamingProd.addRoamingProdCnt) - 1 :
              Number(additionProds.roamingProd.addRoamingProdCnt)
          } :
          {};
        const smartCallPick = smartCallPickProds.listSmartPick;
        // 부가상품에 스마트콜Pick이 있는 경우
        if (smartCallPick.length) {
          if (joinedPaid.length) {
            /*
            if (joinedPaid.filter(item => item.prodId === 'NA00006399').length > 0) {
              // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
              // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
              smartCallPick.forEach((product: any) => {
                const smtCpItemIdx = joinedPaid.findIndex(prod => prod.prodId === product.prod_id);
                if (smtCpItemIdx > -1) {
                  joinedPaid.splice(smtCpItemIdx, 1);
                }
              });
            }
            */
            joinedPaid = joinedPaid.filter(prodJoined => {
              const prodIdJoined = prodJoined.prodId;
              // if (prodIdJoined === 'NA00006399') {
              return !smartCallPick.find(prodSmartCallPick => (prodIdJoined === prodSmartCallPick.prod_id));
              // }
              // return true;
            });
          }
          // TODO: 무료 상품에도 스마트콜픽이 있지 않을 듯 하지만, 확인 후 제거하자!
          if (joinedFree.length) {
            /*
            if (joinedFree.filter(item => item.prodId === 'NA00006399').length > 0) {
              // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
              // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
              smartCallPick.forEach((product: any) => {
                const smtCpItemIdx = joinedFree.findIndex(prod => prod.prodId === product.prod_id);
                if (smtCpItemIdx > -1) {
                  joinedFree.splice(smtCpItemIdx, 1);
                }
              });
            }
            */
            joinedFree = joinedFree.filter(prodJoined => {
              const prodIdJoined = prodJoined.prodId;
              // if (prodIdJoined === 'NA00006399') {
              return !smartCallPick.find(prodSmartCallPick => (prodIdJoined === prodSmartCallPick.prod_id));
              // }
              // return true;
            });
          }
        }
        return {
          joined: {
            paids: joinedPaid, // 유료 부가 상품
            frees: joinedFree // 무료 부가 상품
          },
          roaming, // 로밍 요금제
          dcPrograms: additionProds.disProdList || [], // 옵션/할인 프로그램
          // NOTE: 제목만 노출할 것이므로, 데이터 가공이 필요없다. 아까자
          // dcPrograms: this._convertWirelessDcPrograms(additionProds.disProdList), // 옵션/할인 프로그램
        };
      });
  }

  /**
   * @desc 유선 부가서비스 가져오기
   * @private
   */
  private _getWireAdditions(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0129, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        return {
          joined: {
            paids: (data.pays || []).map(convertAdditionData), // 가입된 유료 부가서비스
            frees: (data.frees || []).map(convertAdditionData) // 가입된 무료 부가서비스
          },
          reserved: data.reserveds.map(convertAdditionData), // 가입 예약된 부가서비스 목록
          joinable: data.joinables.map(convertAdditionData).sort(sortByScrbDt) // 가입 가능한 부가서비스 목록
        };
      }
      return resp;
    });
  }

  // 이번 달 청구/이용 요금
  /*
  private _getFee(svcInfo: any, childInfo: any, allSvc: any): Observable<any> {
    const data: any = {
      // 소액결제 버튼 노출 여부
      isMicroPayment: false,
      // 납부청구 관련 버튼 노출 여부
      isNotAutoPayment: true,
      // 다른 회선 항목
      otherLines: convertOtherLines({...svcInfo}, {...allSvc}),
      // 1일 기준
      isNotFirstDate: (new Date().getDate() > 1) || true, // !BLOCK_ON_FIRST_DAY(==false),
      // 휴대폰, T-PocketFi 인 경우에만 실시간 요금 조회 노출
      isRealTime: (['M1', 'M3'].indexOf(svcInfo.svcAttrCd) > -1),
      // [OP002-3317] 자녀 요금조회
      childLineInfo: childInfo
    };
    // PPS인 경우
    if (svcInfo.svcAttrCd === 'M2') {
      data.type = 'UF';
      data.isNotAutoPayment = false;
      data.isRealTime = false;
      data.isPPS = true;
      return Observable.of(data);
    }
    // [DV001-15583] Broadband 인 경우에 대한 예외처리 수정
    if (svcInfo.actCoClCd === 'B') {
      data.type = 'UF';
      data.isBroadBand = true;
    }
    // 대표청구 여부
    if (svcInfo.actRepYn === 'Y') {
      return this.apiService.request(API_CMD.BFF_05_0203, {}).switchMap(resp => {
        if (resp.code === API_CODE.CODE_00) {
          // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
          if (!resp.result || FormatHelper.isEmpty(resp.result.invDt)) {
            return Observable.of({
              code: API_CODE.CODE_500,
              msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA
            });
          }
          const claim = resp.result;
          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
            svcInfo.nickNm = SVC_ATTR_NAME[svcInfo.svcAttrCd];
          }
          // 청구요금
          if (claim && claim.invDt && claim.invDt.length > 0) {
            data.claim = claim;
            // data.claimFirstDay = DateHelper.getShortFirstDate(claim.invDt);
            // data.claimLastDay = DateHelper.getShortLastDate(claim.invDt);
            // data.claimDate = DateHelper.getShortDateWithFormat(claim.invDt, 'YYYY년 MM월', 'YYYYMM');
            data.claimDate = DateHelper.getShortDateWithFormatAddByUnit(claim.invDt, 1, 'days', 'YYYY년 M월');
            // 사용요금
            // const usedAmt = parseInt(claim.useAmtTot, 10);
            // data.claimUseAmt = FormatHelper.addComma(usedAmt.toString() || '0');
            data.claimUseAmt = FormatHelper.addComma(String(parseNumber(claim.totInvAmt) + parseNumber(claim.dcAmt, true)));
            // 할인요금
            // const disAmt = Math.abs(claim.deduckTotInvAmt);
            // data.claimDisAmt = FormatHelper.addComma((disAmt.toString() || '0'));
            data.claimDisAmt = claim.dcAmt || '0';
            data.claimDisAmtAbs = FormatHelper.addComma(String(parseNumber(data.claimDisAmt, true)));
            // 미납요금
            // data.claimColBamt = claim.colBamt || '0';
            // Total
            data.claimPay = claim.totInvAmt || '0';
          } else {
            data.isRealTime = false;
          }
          // return this.__getUsageClaim();
          return Observable.of(data);
        }
        // SKB(청구대표회선)인 경우 오류code 처리
        if (resp.code === 'BIL0011') {
          data.type = 'UF';
          data.isBroadBand = true;
          return this.__getUsageFee();
        }
        return Observable.of({
          code: resp.code,
          msg: resp.msg
        });
      }).switchMap(resp => {
        if (!resp) {
          return Observable.of(data);
        }
        if (resp.code) {
          return Observable.of(resp);
        }
        return Observable.of({...data, ...resp});
        // return Observable.of(resp);
      }).pipe(
        map((resp: any) => resp)
      );
    }
    data.type = 'UF';
    return this.__getUsageFee().switchMap((resp) => {
      if (!resp) {
        return Observable.of(data);
      }
      if (resp.code) {
        return Observable.of(resp);
      }
      return Observable.of({...data, ...resp});
    }).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  */

  // 미납 요금
  /*
  __getUsageClaim(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        if (data.unPaidTotSum === '0') {
          // no data
          return null;
        }
        return {
          nonpayment: data,
          unPaidTotSum: data.unPaidTotSum && data.unPaidTotSum !== '0' ? FormatHelper.addComma(data.unPaidTotSum) : null
        };
      }
      // error
      return null;
    });
  }
  */

  // 이용 요금
  __getUsageFee(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0204, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        if (!data.invDt || data.invDt.length === 0) {
          // no data
          return {
            isRealTime: false
          };
        }
        return {
          usage: data,
          // usageFirstDay: DateHelper.getShortFirstDate(data.invDt),
          // usageLastDay: DateHelper.getShortLastDate(data.invDt),
          usageDate: DateHelper.getShortDateWithFormat(data.invDt, 'YYYY년 MM월', 'YYYYMM'),
          // 사용요금
          // useAmtTot: FormatHelper.addComma(String(parseInt(usage.useAmtTot, 10)) || '0'),
          useAmtTot: data.invAmt || '0'
        };
      }
      // error
      return resp;
    });
  }

  _getUsagePattern(): Observable<any> {
    if (this._svcType === 0) {
      return this.apiService.request(API_CMD.BFF_05_0091, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const data = resp.result;
          // 자료 없음
          const usagePattern: any = {
            /*
            typeName: null,
            totalUsage: 0,
            aveUsage: 0,
            displayName: null
            */
          };
          if (data.data && data.data.length) {
            // 1. 데이터 처리
            usagePattern.typeName = '데이터';
            usagePattern.totalUsage = data.data.reduce((acc, curr) => {
              /*
               * 단위: KB
               * item.totalUsage: 총 사용량
               * item.basOfrQty: 기본 제공량
               * item.basOfrUsage: 기본 제공량내 사용량
               * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
               */
              return acc + parseInt(curr.totalUsage, 10) || 0;
            }, 0);
            // 3개월 평균 계산 (x / 3)
            // usagePatterns.aveUsage = Number((usagePatterns.totalUsage / 3).toFixed(2)); // floor
            // usagePatterns.aveUsage = Math.round((usagePatterns.totalUsage / 3) * 100) / 100; // ceil
            // 메가 환산 ((x / 3) / 1024)
            usagePattern.displayName = FormatHelper.convDataFormatWithUnit(usagePattern.totalUsage / 3072, 'MB');
          } else if (data.voice && data.voice.length) {
            // 2. 음성 처리
            usagePattern['typeName'] = '음성';
            usagePattern.totalUsage = data.voice.reduce((acc, curr) => {
              /*
               * 단위: 초(sec)
               * item.totalUsage: 총 사용량
               * item.basOfrQty: 기본 제공량
               * item.basOfrUsage: 기본 제공량내 사용량
               * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
               */
              return acc + parseInt(curr.totalUsage, 10) || 0;
            }, 0);
            // 3개월 평균 계산 (x / 3)
            // usagePatterns.aveUsage = Number((usagePatterns.totalUsage / 3).toFixed(2)); // floor
            // usagePatterns.aveUsage = Math.round((usagePatterns.totalUsage / 3) * 10) / 10; // ceil
            // usagePatterns.displayName = FormatHelper.convVoiceFormatWithUnit(usagePatterns.aveUsage);
            const time = FormatHelper.convVoiceFormat(usagePattern.totalUsage / 3);
            const mins = time.hours * 60 + time.min;
            if (mins === 0) {
              usagePattern.displayName = `${time.sec}초`;
            } else if (time.sec === 0) {
              usagePattern.displayName = `${mins}분`;
            } else if (mins > 0 || time.sec > 0) {
              usagePattern.displayName = `${mins}분 ${time.sec}초`;
            }
          } else if (data.sms && data.sms.length) {
            // 3. 문자 처리
            usagePattern['typeName'] = '문자';
            usagePattern.totalUsage = data.sms.reduce((acc, curr) => {
              /*
               * 문자 단위: 건수
               * item.totalUsage: 총 사용량
               * item.basOfrQty: 기본 제공량
               * item.basOfrUsage: 기본 제공량내 사용량
               * item.unlmtType: 무제한 타입 (1: 데이터, 2: SMS, 3: 데이터 및 SMS)
               */
              return acc + parseInt(curr.totalUsage, 10) || 0;
            }, 0);
            // 3개월 평균 계산 (x / 3)
            // usagePatterns.aveUsage = Number((usagePatterns.totalUsage / 3).toFixed(2)); // floor
            // usagePattern.aveUsage = Math.round((usagePattern.totalUsage / 3) * 10) / 10; // ceil
            usagePattern.displayName = `${Math.round((usagePattern.totalUsage / 3) * 10) / 10}건`;
          }
          return usagePattern;
        }
        // error
        return resp;
      });
    }
    return Observable.of(null);
  }

  _getPPS(): Observable<any> {
    if (this._svcType === 1) {
      return this.apiService.request(API_CMD.BFF_05_0013, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const data = resp.result;
          const pps: any = {};
          if (data.dataYn === 'N') {
            if (data.dataOnlyYn === 'Y') {
              // 데이터 요금제 'A'
              pps.type = 'A';
            } else {
              // 음성 요금제 'B'
              pps.type = 'B';
            }
          } else {
            // 음성 + 데이터 요금제 'C'
            if (data.dataOnlyYn === 'N') {
              pps.type = 'C';
            }
          }
          pps.prodAmt = FormatHelper.addComma(data.prodAmt);
          pps.remained = FormatHelper.addComma(data.remained);
          return pps;
        }
        // error
        return resp;
      });
    }
    return Observable.of(null);
  }

  // 나의 결합 상품 건수
  private _getCombinations() {
    const command = !this._isWireless ? API_CMD.BFF_05_0133 : API_CMD.BFF_05_0161;
    return this.apiService.request(command, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if (!this._isWireless) {
          return {
            comProdCnt: ((resp.result || {}).combinationMemberList || []).length
          };
        }

        return resp.result;
      }
      // error
      return null;
    });
  }
}

export default MyTJoinMyplan;
