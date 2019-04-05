/**
 * MenuName: 나의 요금 > 요금안내서 > 다른회선요금조회(자녀)(MF_09_01)
 * @file myt-fare.bill.guide.child.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.12.13
 * Summary: 나의 요금 > 요금안내서 > 자녀이용요금 화면
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE } from '../../../../types/string.type';

class MyTFareBillGuideChild extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;  // 쿼리스트링
  public pageInfo: any;
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036 , 사용요금조회 | BFF_05_0047
  // private _useFeeInfo: any = {}; // 사용요금조회 | BFF_05_0047
  private _intBillLineInfo: any = {}; // 통합청구등록회선조회 | BFF_05_0049
  private _unpaidBillsInfo: any = {}; // 미납내역 조회 | BFF_05_0030
  private _childLineInfo: any = {}; // 자녀회선 조회 | BFF_05_0024
  private _ppsInfo: any; // PPS 요금안내서 정보조회

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
    repSvcNm: '', // 대표서비스회선정보

    prodNm: '', // pps 요금제
    prodAmt: '', // pps 잔액
    useEndDt: '', // pps 발신/사용기간
    dataKeepTrmDt: '', // pps 수신/데이터유지기간
    numKeepTrmDt: '', // pps 번유지기간
    curDt: '', // 현재날짜
    remained: '', // 잔여데이터 KB | 공백일 경우 표시안함
    dataYn: '', // 음성+데이터 'Y'
    dataProdYn: '', // MB 'Y' | 원 'N'

    ppsType: '', // pps 요금제 종류 'A', 'B', 'C'
    ppsProdAmt: '', // 카드잔액(원/mb)
    ppsRemained: '', // 잔여대이터(kb)
    ppsObEndDt: '', // 발신종료일자
    ppsInbEndDt: '', // 수신종료일자
    ppsNumEndDt: '', // 번호유지종료일자
    ppsCurDate: '', // 현재시간
    ppsStartDateVal: '',
    ppsStartDateTxt: '',
    ppsEndDateVal: '',
    ppsEndDateTxt: ''
  };

  // 노출조건
  private _showConditionInfo: any = {
    autopayYn: null, // 자동납부신청
    nonPaymentYn: null, // 납부전
    selectNonPaymentYn: null, // 선택한 월에  납부완료 Y or N

    childYn: null, // 자녀회선
    phoneYn: null, // 선택회선이 휴대폰
    chargeTtYn: null, // 요금제: "T끼리 T내는 요금" prodId : "NA00001901"
    paymentBtnYn: null, // 납부가능일 버튼
    suspensionYn: null // 이용정지해제 버튼
  };


  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;

    if (FormatHelper.isEmpty(req.query.line)) {
      this.logger.error(this, `Not found parameter \'line\'`);
      return thisMain.error.render(res, {
        title: 'title',
        msg: 'Requred parameter \'line\'',
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }

    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);
    this.logger.info(this, '[ childInfo ] : ', childInfo);
    allSvc = allSvc || { 's': [], 'o': [], 'm': [] };

    thisMain.childBillGuide(res, svcInfo, allSvc, pageInfo, childInfo);
  }

  private childBillGuide(res, svcInfo, allSvc, pageInfo, childInfo) {
    const thisMain = this;
    this.reqQuery.line = (this.reqQuery.line) ? this.reqQuery.line : '';
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';

    /*
    * 실 데이터 - 사용요금조회
    */
    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0047, {
      invDt: this.reqQuery.date,
      childSvcMgmtNum: this.reqQuery.line
    }, null, [], API_VERSION.V2), 'p1');

    // const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0030, {}), 'p2');

    Promise.all([p1]).then(function(resArr) {

      thisMain._billpayInfo = resArr[0].result.invAmtList.find(item => item.invDt === thisMain.reqQuery.date)
        || resArr[0].result.invAmtList[0];
      // 청구월 목록
      thisMain._billpayInfo.invDtArr = resArr[0].result.invAmtList.map(item => item.invDt);
      // 미납요금
      thisMain._unpaidBillsInfo = resArr[0].result.unPayAmtList;

      thisMain._commDataInfo.selClaimDt = thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt));
      thisMain._commDataInfo.selClaimDtM = thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt));
      thisMain._commDataInfo.selStaDt = thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt));
      thisMain._commDataInfo.selEndDt = thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt));
      thisMain._commDataInfo.discount = FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.dcAmt))));
      thisMain._commDataInfo.joinSvcList = (!thisMain.reqQuery.line) ? thisMain.paidAmtSvcCdListFun() : null;
      thisMain._commDataInfo.useAmtTot = FormatHelper.addComma(thisMain._billpayInfo.totInvAmt);
      thisMain._commDataInfo.intBillLineList =
        (thisMain._intBillLineInfo) ? thisMain.intBillLineFun(childInfo, thisMain.reqQuery.line) : null;

      // thisMain._billpayInfo.invDtArr = thisMain._billpayInfo.invSvcList.map(item => item.invDt);
      // 청구월 목록 (화면)
      thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;

      thisMain.renderView(res, 'billguide/myt-fare.bill.guide.child.html', {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        billpayInfo: thisMain._billpayInfo,
        commDataInfo: thisMain._commDataInfo,
        intBillLineInfo: thisMain._intBillLineInfo,
        childLineInfo: thisMain._childLineInfo,
        showConditionInfo: thisMain._showConditionInfo,
        unpaidBillsInfo: thisMain._unpaidBillsInfo || null,
        allSvc: allSvc
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

  }


  // -------------------------------------------------------------[SVC]
  public getSelStaDt(date: string): any { // 월 시작일 구하기
    // return this._commDataInfo.selStaDt = moment(date).startOf('month').format('YYYY.MM.DD');
    return this._commDataInfo.selStaDt = DateHelper.getStartOfMonDate( date, 'YYYY.M.D.');
  }

  public getSelEndDt(date: string): any { // 월 끝나는 일 구하기
    // return this._commDataInfo.selEndDt = moment(date).endOf('month').format('MM.DD');
    return this._commDataInfo.selEndDt = DateHelper.getEndOfMonDate( date, 'YYYY.M.D.');
  }

  public getSelClaimDt(date: string): any { // 청구 년월 구하기
    // return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format( MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    return this._commDataInfo.selClaimDt =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
  }

  public getSelClaimDtM(date: string): any { // 청구 년월 구하기
    // return this._commDataInfo.selClaimDtM = moment(date).add(1, 'days').format('M');
    return this._commDataInfo.selClaimDtM =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', 'M' );
  }

  /**
   * 회선정보 목록 리턴
   * @param allSvc
   * @return {svcType: '전체'} + 회선정보 목록
   */
  public intBillLineFun(childInfo: any, svcMgmtNum: string) {
    const thisMain = this;
    const svcTotList = childInfo ? childInfo.slice() : [];

    for ( let i = 0; i < svcTotList.length; i++ ) {
      const item = svcTotList[i];
      if ( item.svcMgmtNum === svcMgmtNum ) {
        item.label = thisMain.phoneStrToDash(item.svcNum);
        return [item];
      }
    }

    return [];
  }

  /**
   * 조회조건 날짜 목록을 리턴
   * 날짜는 모두 말일 -> +1일해서 다음 월로 리턴
   */
  public conditionChangeDtListFun() {

    const thisMain = this;
    const dtList = thisMain._billpayInfo.invDtArr ? thisMain._billpayInfo.invDtArr.slice() : [];
    for ( let i = 0; i < dtList.length; i++ ) {
      dtList[i] = DateHelper.getShortDateWithFormatAddByUnit(dtList[i], 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    }
    return dtList;
  }

  public paidAmtSvcCdListFun() {
    const thisMain = this;
    const paidAmtSvcCdList = thisMain._billpayInfo.paidAmtSvcCdList || [];
    for ( let i = 0; i < paidAmtSvcCdList.length; i++ ) {
      paidAmtSvcCdList[i].amt = FormatHelper.addComma(paidAmtSvcCdList[i].amt);
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
      }
    }
    return paidAmtSvcCdList;
  }


  // 별표가 있는 휴대폰 번호 대시 적용
  public phoneStrToDash(strCellphoneNum: string): string {
    if ( !strCellphoneNum ) {
      return '';
    }
    // return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
    return StringHelper.phoneStringToDash(strCellphoneNum.replace(/-/g, ''));
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

}

export default MyTFareBillGuideChild;
