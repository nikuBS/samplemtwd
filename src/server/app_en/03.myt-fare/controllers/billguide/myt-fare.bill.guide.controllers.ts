/**
 * MenuName: My Bills > Bills 통합(대표,일반)청구회선(MF_02_01)
 *           My Bills > Bills 개별청구회선(MF_02_03)
 * @file myt-fare.bill.guide.controller.ts
 * @author  (skt.P165332@partner.sk.com)
 * @since 2020.09
 * Summary: 요금안내서 화면으로 진입 후 조건에 맞게 화면 분기 및 청구요금 조회
 */
import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types_en/api-command.type';

import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils_en/string.helper';
import DateHelper from '../../../../utils_en/date.helper';
import FormatHelper from '../../../../utils_en/format.helper';
import { MYT_FARE_BILL_GUIDE, MYT_JOIN_WIRE_SVCATTRCD } from '../../../../types_en/string.type';
import {MYT_FARE_SUBMAIN_TITLE} from '../../../../types_en/title.type';
// OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
import CommonHelper from '../../../../utils_en/common.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from 'constants';
import {MytFareInfoMiriService} from '../../services/info/myt-fare.info.miri.service';

class MyTFareBillGuide extends TwViewController {
  
  constructor() {
    super();
  }

  public reqQuery: any;  // 쿼리스트링
  public pageInfo: any;
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036 , 사용요금조회 | BFF_05_0047
  private _useFeeInfo: any = {}; // 사용요금조회 | BFF_05_0047
  private _intBillLineInfo: any = []; // 통합청구등록회선조회 | BFF_05_0049
  private _miriService!: MytFareInfoMiriService;
  // 공통데이터
  private _commDataInfo: any = {
    selClaimDt: '', // 선택 청구 월 | 2017년 10월
    selClaimDtM: '', // 선택 청구 월 | number
    selStaDt: '', // 선택시작
    selEndDt: '', // 선택끝
    discount: '', // 할인액
    joinSvcList: '', // 가입 서비스 리스트
    useAmtTot: '', // 사용요금

    conditionChangeDtList: '', // 조건변경 > 기간
    repSvcNum: ''

  };

  private _miriData;

  private _urlTplInfo: any = {
    commonPage: 'billguide/en.myt-fare.bill.guide.html', // 공통 페이지
//    individualPage: 'billguide/en.myt-fare.bill.guide.individual.html', // 영문화 추가 개별청구
    individualPage: 'billguide/en.myt-fare.bill.guide.html', // 영문화 추가 개별청구
    prepaidPage: 'billguide/en.myt-fare.bill.guide.pps.html', // PPS(선불폰)
    // NOTE: OP002-8156: 아래 회선은 구할 수 없음 (확인: 문종수)
    companyPage: 'billguide/en.myt-fare.bill.guide.solution.html', // 기업솔루션(포인트캠)
    // NOTE: OP002-8156: 아래 회선은 모바일에서 값을 보여줄 수 없음 (확인: 문종수)
    skbroadbandPage: 'billguide/en.myt-fare.bill.guide.skbd.html' // sk브로드밴드(인터넷/IPTV/집전화)

  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const thisMain = this;
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo);
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    this.reqQuery.line = (this.reqQuery.line) ? this.reqQuery.line : '';
    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';
    
    const defaultData = {
      reqQuery: thisMain.reqQuery,
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcAttrCd: svcInfo.svcAttrCd,
      allSvc: allSvc,
      errorMsg: ''
    };
     
    BrowserHelper.isApp(req) ? thisMain.getAppXtEid(defaultData) : thisMain.getMWebXtEid(defaultData);

    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    CommonHelper.addCurLineInfo(svcInfo);

    allSvc = allSvc || { 's': [], 'o': [], 'm': [] };

    const test = this.reqQuery.test;  // 테스트 parameter

    /*
     svcInfo.svcAttrCd === 'M2'
     svcInfo.actCoClCd === 'B'
     svcInfo.svcAttrCd === 'O1'
    */
    if ( test === '500' ) {
      return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });
    }

    // 영문화 유선회선인경우 회선변경 안내페이지로 이동
    if (svcInfo.svcAttrCd !== '' && ['M1', 'M3'].indexOf(svcInfo.svcAttrCd) === -1 || test === 'notPhone'  ) {
      this._typeChk = 'A3';
      res.render( 'billguide/en.myt-fare.bill.guide.not.phone.html', { data : defaultData, svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }
    // 무선회선이 없는경우
    if (svcInfo.caseType === '02' || test === 'notLine' ) {
      defaultData.errorMsg = 'LINE_NOT_EXIST';
      res.render('billguide/en.myt-fare.bill.guide.not.line.html' , { data : defaultData, svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }

    // 무선 회선은 있지만 등록된 회선이 없는경우
    if (svcInfo.caseType === '03' || svcInfo.nonSvcCnt === 0 || test === 'notRegi') {
      defaultData.errorMsg = 'LINE_NOT_REGIST';
      res.render('billguide/en.myt-fare.bill.guide.not.line.html' , { data : defaultData, svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }



    // ---------------------------------------------------------------------------------[화면 구분]
    /*
    * A4. 개별청구회선 | this._billpayInfo.paidAmtMonthSvcCnt === 1
    * A5. 통합청구회선 대표 | this._billpayInfo.repSvcYn === 'Y'
    * A6. 통합청구회선 대표아님 |
     */


    const reqArr: Array<any> = [];

    // 청구요금 조회 : 대표청구 여부(svcInfo.actRepYn) Y인 경우
 // console.log("[ 대표청구여부 svcInfo.actRepYn ] "+svcInfo.actRepYn);

    // 종속 회선인경우 조회불가 페이지로 이동
    if ( svcInfo.actRepYn !== 'Y' || test === 'subline') {
      return res.render( 'billguide/en.myt-fare.bill.guide.subline.html',
                          {data : defaultData, svcInfo : svcInfo, pageInfo : thisMain.pageInfo });

    } else {
//    console.log("[ API ] BFF_05_0226");

        
        reqArr.push(this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0226, {
          invDt: this.reqQuery.date,
          selSvcMgmtNum : this.reqQuery.line
        }, null, [], API_VERSION.V1), 'p1'));  
  

    }
    
    this.logger.info(this, '[ PPS, 기업솔루션이 아닌경우 ]');

    Promise.all(reqArr).then(function(resArr) {
      thisMain.logger.info(thisMain, '[ Promise.all > success ] : ', resArr);
      try {
        // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
        if (resArr[0].code !== API_CODE.CODE_00 || FormatHelper.isEmpty(resArr[0].result)) {
          return res.render( 'billguide/en.myt-fare.bill.guide.nopay6month.html'  , { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });

        //  return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });
        /*
          return thisMain.error.render(res, {
            title: 'title',
            code: API_CODE.CODE_500,
            msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        */
        }

        // 청구 요금 데이터
        // OP002-2986 로 청구 데이터 안들어올 수 있으므로 디폴트 세팅 해준다.
        // thisMain._billpayInfo = {
        //   invDt: '',
        //   totInvAmt: '',
        //   dcAmt: '',
        //   invSvcList: [],
        //   paidAmtSvcCdList: [],
        //   paidAmtDetailList: [],
        // };
        thisMain._billpayInfo = {
          invDt: '',
          useAmtTot: '',
          deduckTotInvAmt: '',
          invDtArr: [],
          paidAmtMonthSvcCnt : 0,
          paidAmtMonthSvcNum: [],
          paidAmtDetailInfoList: [],
        };
        // console.log("============ resArr[0].result =================");
        // console.log("=====>> ", resArr[0].result);
        // console.log("============================================");

        Object.assign(thisMain._billpayInfo, resArr[0].result);

        thisMain.logger.debug('[ API BFF_05_0226 Result ]', thisMain._billpayInfo);


        // 청구 시작, 종료일
        thisMain._commDataInfo.selClaimDt = (thisMain._billpayInfo) ? thisMain.getSelClaimDt(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selClaimDtM = (thisMain._billpayInfo) ? thisMain.getSelClaimDtM(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selStaDt = (thisMain._billpayInfo) ? thisMain.getSelStaDt(String(thisMain._billpayInfo.invDt)) : null;
        thisMain._commDataInfo.selEndDt = (thisMain._billpayInfo) ? thisMain.getSelEndDt(String(thisMain._billpayInfo.invDt)) : null;

        thisMain._commDataInfo.repSvcNum = thisMain.phoneStrToDash(svcInfo.svcNum);

        // console.log("#######################################################################");
        // console.log("#### thisMain._commDataInfo.selClaimDt"+thisMain._commDataInfo.selClaimDt);
        // console.log("#### thisMain._commDataInfo.selClaimDtM"+thisMain._commDataInfo.selClaimDtM);
        // console.log("#### thisMain._commDataInfo.selStaDt"+thisMain._commDataInfo.selStaDt);
        // console.log("#### thisMain._commDataInfo.selEndDt"+thisMain._commDataInfo.selEndDt);
        // console.log("######################################################################");
        
        // 총 요금, 할인요금
    //    thisMain._commDataInfo.useAmtTot = FormatHelper.addComma(thisMain._billpayInfo.totInvAmt.replace(/,/g, ''));
    
        // 영문화 필드변경
        thisMain._commDataInfo.useAmtTot = FormatHelper.addComma(thisMain._billpayInfo.useAmtTot.replace(/,/g, ''));
        
        // console.log(" ===============================================================================" );
          // thisMain._commDataInfo.discount =
          //   FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.dcAmt.replace(/,/g, '')))));

        // 영문화 필드변경
        thisMain._commDataInfo.discount =
            FormatHelper.addComma(String(Math.abs(Number(thisMain._billpayInfo.deduckTotInvAmt.replace(/,/g, '')))));

    //    thisMain._commDataInfo.paidAmtMonthSvcCnt     = thisMain._billpayInfo.paidAmtMonthSvcCnt;
    //    thisMain._commDataInfo.paidAmtDetailInfoList  = thisMain._billpayInfo.paidAmtDetailInfoList;
    //    thisMain._commDataInfo.dtlLst = thisMain.arrangeCategory( thisMain._billpayInfo.paidAmtDetailInfoList );
    //    thisMain.arrangeCategory( thisMain._billpayInfo.paidAmtDetailInfoList );


        const beLineLst = thisMain._billpayInfo.paidAmtDetailInfoList;
      //  console.log("### line length =>"+beLineLst.length);
        
        const _lineDtlLst: Array<any> = [];        
        for ( let i = 0; i < beLineLst.length; i++ ) {

          const line = beLineLst[i];
     //     if(line.svcCd !== 'C') continue;  //무선 아닌경우 표시안함.
        //  console.log("cate length =>"+line.paidAmtDetailInfo.length);
          const lineGroup = thisMain._arrayToGroup( line.svcNm , line.svcCd, line.paidAmtDetailInfo );
        //  console.log('>> group >>',lineGroup);
        //  console.log(" ===============================================================================" );
          _lineDtlLst.push( lineGroup );
        }

        // 큰금액순으로 정렬
        _lineDtlLst.sort(function(a, b ) {
          return a.totAmtInt > b.totAmtInt ? -1 : a.totAmtInt < b.totAmtInt ? 1 : 0;
        });

        //  console.log("### _lineDtlLst length =>"+_lineDtlLst.length);

        //  청구 날짜 화면 출력 목록 (말일 날짜지만 청구는 다음달이기 때문에 화면에는 다음 월로 나와야함)
        thisMain._commDataInfo.conditionChangeDtList = (thisMain._billpayInfo.invDtArr ) ? thisMain.conditionChangeDtListFun() : null;
      //  console.log('[ ## EN thisMain._commDataInfo.conditionChangeDtList]',thisMain._commDataInfo.conditionChangeDtList);
        const data: any = {
          data : {
            reqQuery: thisMain.reqQuery,
            svcMgmtNum: svcInfo.svcMgmtNum,
            svcAttrCd: svcInfo.svcAttrCd,
            allSvc: allSvc,
            billpayInfo: thisMain._billpayInfo,
            commDataInfo: thisMain._commDataInfo,
            intBillLineInfo: thisMain._intBillLineInfo,

            // 영문화 추가
            repSvcNum: thisMain._commDataInfo.repSvcNum,
          paidAmtMonthSvcCnt: thisMain._billpayInfo.paidAmtMonthSvcCnt,
//            paidAmtMonthSvcCnt: _lineDtlLst.length,
            paidAmtDetailInfoList: thisMain._commDataInfo.paidAmtDetailInfoList,
            lineDtlLst : _lineDtlLst,
            typeChk: ''
          },
          svcInfo: svcInfo,
          pageInfo: thisMain.pageInfo,
          useFeeInfo: thisMain._useFeeInfo,
          miriAmt : thisMain._miriData 
        };

 
        // 다른 페이지를 찾고 계신가요 통계코드 추가
        BrowserHelper.isApp(req) ? thisMain.getAppXtEid(data.data) : thisMain.getMWebXtEid(data.data);
        
        const existBill = (listName) => {
          const obj = thisMain._billpayInfo;
          return obj.useAmtTot !== 0 || (obj[listName] || []).length > 0;
        };

        if ( svcInfo.actRepYn === 'N' ) {

          thisMain.logger.info(thisMain, '[ 통합청구회선 > 대표 아님!!!! ]', thisMain._billpayInfo.repSvcYn);
          thisMain._typeChk = 'A6';

          // 사용요금/청구요금이 존재하는지
        //  영문화 사용안함
        //  thisMain._billpayInfo.existBill = existBill('usedAmountDetailList');
          
          // 영문화 종속회선 조회불가
          return res.render( 'billguide/en.myt-fare.bill.guide.subline.html',
          { svcInfo : svcInfo, pageInfo : thisMain.pageInfo });

        } else if ( svcInfo.actRepYn === 'Y' ) {

          // 조회일자에 맞는 서비스리스트
       //   const daySvcList = thisMain._billpayInfo.invDtArr.find(item => item === thisMain._billpayInfo.invDt) || {}; //영문화 제거
          // 사용요금/청구요금이 존재하는지
          thisMain._billpayInfo.existBill = existBill('paidAmtDetailInfoList');

          // 개별청구 회선
        // if ( thisMain._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
          if ( data.data.lineDtlLst.length === 1 ) {

            thisMain.logger.info(thisMain, '[ 개별청구회선 ]', thisMain._billpayInfo.paidAmtMonthSvcCnt);
            thisMain._typeChk = 'A4';

            // 영문화
            data.data.typeChk = thisMain._typeChk;
            return thisMain.renderView(res, thisMain._urlTplInfo.individualPage, data);

          // 통합청구 회선
          } else {

            // 조회시 대표청구회선이거나 || 세션이 대표청구회선이면서 조회회선을 조회했을 경우
            if ( svcInfo.actRepYn === 'Y' || (svcInfo.actRepYn === 'Y' && thisMain.reqQuery.line) ) {
              thisMain.logger.info(thisMain, '[ 통합청구회선 > LINE:' + thisMain.reqQuery.line + ']', svcInfo.actRepYn);
              thisMain._typeChk = 'A5';
              // thisMain._commDataInfo.joinSvcList = (!thisMain.reqQuery.line) ? thisMain.paidAmtSvcCdListFun() : null;

              // 요금납부버튼 무조건 노출로 삭제
              // thisMain._showConditionInfo.autopayYn = (thisMain._billpayInfo) ? thisMain._billpayInfo.autopayYn : null;

              // thisMain._showConditionInfo.nonPaymentYn = (thisMain._unpaidBillsInfo.unPaidAmtMonthInfoList.length === 0) ? 'N' : 'Y';
              // thisMain._showConditionInfo.selectNonPaymentYn = thisMain.getSelectNonPayment();
              // data['showConditionInfo'] = thisMain._showConditionInfo;
            }
          }
        }

        data.typeChk = thisMain._typeChk;
        data.data.typeChk = thisMain._typeChk;
//      thisMain.reqButtonView(res, thisMain._urlTplInfo.commonPage, data);//영문화 사용안함

        thisMain.renderView(res, thisMain._urlTplInfo.commonPage, data);

        thisMain.logger.info(thisMain, '-------------------------------------[Type Check END]');
        thisMain.logger.info(thisMain, '[ 페이지 진입 ] this._typeChk : ', thisMain._typeChk);

      } catch ( e )  {
        thisMain.logger.info(e);
        // return thisMain.error.render(res, {
        //   title: 'title',
        //   code: API_CODE.CODE_500,
        //   msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA,
        //   pageInfo: pageInfo,
        //   svcInfo: svcInfo
        // });
        
        return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });

      }
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      // 6개월간 청구요금 없음 에러페이지로 표시
      // return thisMain.error.render(res, {
      //   title: 'title',
      //   code: err.code,
      //   msg: err.msg,
      //   pageInfo: pageInfo,
      //   svcInfo: svcInfo
      // });

      // 6개월간 청구요금 없음
      if ( err.code === 'BIL0076' || err.code === 'BIL0114') {
        return res.render( 'billguide/en.myt-fare.bill.guide.nopay6month.html',
          { data: defaultData , svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      }
      // 회선이 query에 있어 오류가 나면 기본 페이지로 돌아간다.
      if ( thisMain.reqQuery.line ) {
        res.redirect('/en/myt-fare/billguide/guide');
      }
      return thisMain.error.render(res, {
        title: 'title',
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });

  }

  // public getCurDate(): any {
  //   return moment().format('YYYY.MM.DD hh:mm');
  // }
  // 당월 시작일
  public getStartDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').startOf('month').format(formatStr);
    return DateHelper.getStartOfMonSubtractDate(undefined, '2', formatStr);
  }
  // 당월 종료일
  public getEndDateFormat(formatStr): any {
    // return moment().subtract('1', 'months').endOf('month').format(formatStr);
    return DateHelper.getEndOfMonSubtractDate(undefined, '1', formatStr);
  }
  // 월 시작일 구하기
  public getSelStaDt(date: string): any {
    // return this._commDataInfo.selStaDt = moment(date).startOf('month').format('YYYY.MM.DD');
    return this._commDataInfo.selStaDt = DateHelper.getStartOfMonDate( date, 'YYYY.M.D.');
  }
  // 월 끝나는 일 구하기
  public getSelEndDt(date: string): any {
    // return this._commDataInfo.selEndDt = moment(date).endOf('month').format('MM.DD');
    return this._commDataInfo.selEndDt = DateHelper.getEndOfMonDate( date, 'YYYY.M.D.');
  }
  // 청구 년월 구하기
  public getSelClaimDt(date: string): any {
    // return this._commDataInfo.selClaimDt =
    //   DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE );
    // NOTE this._commDataInfo.selClaimDt에 대입 불필요로 보임.
    return date ? DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', 'MMM. YYYY.' ) : '';
  }
  // 청구 년월 구하기
  public getSelClaimDtM(date: string): any {
    // return this._commDataInfo.selClaimDtM = moment(date).add(1, 'days').format('M');
    return this._commDataInfo.selClaimDtM =
      DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', 'MMM.' );
  }
  
  /**
   * 회선정보 목록 리턴
   * @param allSvc
   * @return {svcType: '전체'} + 회선정보 목록
   */
  public intBillLineFun(allSvc: any) {
    const thisMain = this;

    const svcTotList = thisMain._intBillLineInfo || [];

    for ( let i = 0; i < svcTotList.length; i++ ) {
      const item = svcTotList[i];
      const svcItem = this.getAllSvcItem(allSvc, item.svcMgmtNum);

      item.svcType = this.getSvcType(item.name);
      item.label = item.name.substring(item.name.indexOf('(') + 1, item.name.indexOf(')') );

      if (item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M1 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M2 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M3 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.M4 ||
          item.svcType === MYT_JOIN_WIRE_SVCATTRCD.S3 ) {

        item.label = thisMain.phoneStrToDash(svcItem ? svcItem.svcNum : item.label);

      }
    }
    svcTotList.unshift({ svcType: MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE } );
    return svcTotList;
  }

  /**
   * 이름으로 svcType을 리턴
   * svcType = 휴대폰, 선불폰, T pocket Fi, T Login, T Wibro, 인터넷, IPTV, 집전화, 포인트캠
   * @param nm
   */
  private getSvcType(nm: String) {
    nm = nm.replace(/ /g, '').toLowerCase();

    // svcType
    if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M1) !== -1
      || nm.indexOf(MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) !== -1 ) {   // 이동전화
      return MYT_JOIN_WIRE_SVCATTRCD.M1;   // 휴대폰

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M2) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M2;      // 선불폰

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M3.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M3;      // T pocket Fi

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M4.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M4;      // T Login

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.M5.replace(/ /g, '').toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.M5;      // T Wibro

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S1) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.S1;      // 인터넷

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S2.toLowerCase()) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.S2;      // TV

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.S3) !== -1
      || nm.indexOf(MYT_FARE_BILL_GUIDE.TEL_TYPE_1) !== -1 ) {
      return MYT_JOIN_WIRE_SVCATTRCD.S3;      // 집전화

    } else if ( nm.indexOf(MYT_JOIN_WIRE_SVCATTRCD.O1) !== -1) {
      return MYT_JOIN_WIRE_SVCATTRCD.O1;      // 포인트캠

    }
  }

  public getAllSvcItem(allSvc: any, svcMgmtNum: string) {
    if ( !allSvc ) {
      this.logger.error(this, 'allSvc is ' + allSvc);
      return null;
    }
    const listM = allSvc.m || [];
    const listS = allSvc.s || [];
    const listO = allSvc.o || [];
    const item =
      listM.find(svc => svc.svcMgmtNum === svcMgmtNum ) ||
      listS.find(svc => svc.svcMgmtNum === svcMgmtNum ) ||
      listO.find(svc => svc.svcMgmtNum === svcMgmtNum );
    return item;
  }

  /**
   * 조회조건 날짜 목록을 리턴
   * 날짜는 모두 말일 -> +1일해서 다음 월로 리턴
   */
  public conditionChangeDtListFun() {

    const thisMain = this;
    const dtList = thisMain._billpayInfo.invDtArr ? thisMain._billpayInfo.invDtArr.slice() : [];
    for ( let i = 0; i < dtList.length; i++ ) {
      dtList[i] = DateHelper.getShortDateWithFormatAddByUnit(dtList[i], 1, 'days', 'MMM. YYYY.' );
    }
    return dtList;
  }

  /**
   * 통합(대표)청구화면에서 (총 청구요금 하단) 회선,금액 목록 데이터를 금액:포맷팅, 서비스명:통일 해서 리턴
   */
  public paidAmtSvcCdListFun() {
    const thisMain = this;
    const paidAmtSvcCdList = thisMain._billpayInfo.paidAmtSvcCdList || [];
    for ( let i = 0; i < paidAmtSvcCdList.length; i++ ) {
      paidAmtSvcCdList[i].amt = FormatHelper.addComma(paidAmtSvcCdList[i].amt);
      // 이동전화 -> 휴대폰
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
      }
      // 유선전화 -> 집전화
      if ( paidAmtSvcCdList[i].svcNm === MYT_FARE_BILL_GUIDE.TEL_TYPE_1) {
        paidAmtSvcCdList[i].svcNm = MYT_FARE_BILL_GUIDE.TEL_TYPE_0;
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




  // -------------------------------------------------------------[클리이어트로 전송]
  public renderView(res, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    if (data.data) {
      data.data.allSvc = this.getAllSvcClone(data.data.allSvc);
    }

    Observable.combineLatest(
      this._miriService.getMiriPayment(this._billpayInfo.invDt)
    ).subscribe(( miri) => {

      data.data.miriAmt = miri[0];
      this.logger.info(this, '[ ---------------------------- ] : ', data);

      return res.render(view, data);
    });
    
  }
  _parseInt(str: String) {
    if ( !str ) {
      return 0;
    }

    return parseInt(str.replace(/,/g, ''), 10);
  }

  /**
   * allSvc에서 필요한 정보만 복사
   * @param allSvc
   */
  private getAllSvcClone(allSvc: any) {
    if ( !allSvc ) {
      return null;
    }
    return {
      'm': this.copyArr(allSvc.m),
      's': this.copyArr(allSvc.s),
      'o': this.copyArr(allSvc.o)
    };
  }
  private copyArr(arr: Array<any>) {
    if ( !arr ) {
      return arr;
    }
    const tmpArr: Array<any> = [];
    for ( let i = 0 ; i < arr.length; i++ ) {
      tmpArr.push(this.copyObj(arr[i], ['svcMgmtNum', 'prodId', 'prodNm']));
    }
    return tmpArr;
  }
  private copyObj(obj: any, keys: Array<any>) {
    if ( !obj ) {
      return obj;
    }
    const tmp = {};
    for ( let i = 0; i < keys.length; i++) {
      if ( obj.hasOwnProperty(keys[i]) ) {
        tmp[keys[i]] = obj[keys[i]];
      }
    }
    return tmp;
  }

  // 청구요금 상세 그룹화.
  public _arrayToGroup( name: string , svcCd: string , data: Array<any> ) {
    var func = this;
    const fieldInfo = {
        lcl:    'billItmLclNm'
      , scl:    'billItmSclNm'
      , name:   'billItmNm'
      , value:  'invAmt'
    };

    const NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
    const HOTBILL_UNPAID_TITLE = '';

    // var self = this;
    /*
      C: '휴대폰',
      S: 'PPS',
      F: 'TPocket-FI',
      L: 'Tlogin',
      W: 'WiBro',
      P: '집전화',
      T: 'IPTV',
      I: '인터넷'
    */
    var amount = 0;
    var noVAT = false;
    var is3rdParty = false;
    var line = {
      name: ''
      , totAmt: ''
      , totAmtInt: 0
      , group:{}
      , isMPhone: false
      , isTPhone: false
      , isIpTV: false
      , isInternet: false 
      , isPocket: false 
    };
    var group = {};
    var totAmt = 0;
    var DEFAULT_DESC_VISIBILITY = true;
    var groupInfoFields = NO_BILL_FIELDS;
    

    data.forEach(function (item) {
      noVAT = false;
      is3rdParty = false;
      var groupL = item[fieldInfo.lcl];
      var groupS = item[fieldInfo.scl];
  
      if ( !group[groupL] ) {
        group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
        if ( groupL === HOTBILL_UNPAID_TITLE ) {
          group[groupL].showDesc = false;
        }
      }
      
      if ( groupS.indexOf('*') > -1 ) {
        groupS = groupS.replace(/\*/g, '');
        noVAT = true;
      } else if ( groupS.indexOf('#') > -1 ) {
        groupS = groupS.replace(/#/g, '');
        is3rdParty = true;
      }
      
      // console.log("## groupS ==>"+groupS+" vat=>"+noVAT+" 3rd=>"+is3rdParty);
  
      if ( !group[groupL][groupS] ) {
        group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
      }

      amount = func.parseCommaedStringToInt(item[fieldInfo.value]);
      group[groupL].total += amount;
      group[groupL][groupS].total += amount;
      totAmt += amount;

      var bill_item = {
        name: item[fieldInfo.name].replace(/[*#]/g, ''),
        amount: (amount < 0 ? '-₩' : '₩') + func.commaSeparatedString( Math.abs(item[fieldInfo.value]) ),
        noVAT: item[fieldInfo.name].indexOf('*') > -1,
        is3rdParty: item[fieldInfo.name].indexOf('#') > -1,
        discount: amount < 0
      };

      group[groupL][groupS].items.push( Object.assign({}, bill_item) );
      
      bill_item.amount = item[fieldInfo.value];
    });
  
      // 아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
      // $.each(group, function (key1, itemL) {
      //   $.each(itemL, function (key2, itemS) {
      //     if ( groupInfoFields.indexOf(key2) < 0 ) {
      //       if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
      //         itemS.items.splice(0,1);
      //       }
      //       itemS.discount = itemS.total < 0;
      //       itemS.total = Tw.StringHelper.commaSeparatedString(itemS.total);
      //     }
      //     itemL.discount = itemL.total < 0;
      //     itemL.total = Tw.StringHelper.commaSeparatedString(itemL.total);
      //   });
      // });

      // 합계처리 단위처리 합계 할인속성 설정.
      // tslint:disable-next-line: forin
      for (var key1 in group) {
        // console.log("key1 ==>"+key1);
        // tslint:disable-next-line: prefer-const
        let itemL = group[key1];
        itemL.discount = itemL.total < 0;
        itemL.total = (itemL.total < 0 ? '-₩' : '₩') + func.commaSeparatedString( Math.abs(itemL.total));
        // console.log('itemL ==>' + itemL);
        for (var key2 in itemL) {
          // console.log("     key2 ==>"+key2);
          if (groupInfoFields.indexOf(key2) < 0 ) {
            const itemS = itemL[key2];
            // item 부모 item 과 이름 같은경우 병합. 테스트후 적용.
            // if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
            //   itemS.items.splice(0,1);
            // }

            // console.log ("     itemS.total ==>",itemS.total);
            itemS.discount = itemS.total < 0;
         
            itemS.total = (itemS.total < 0 ? '-₩' : '₩') + func.commaSeparatedString( Math.abs(itemS.total) );
          }

        //  console.log ('     itemS.discount ==>', itemS.discount);
        //  console.log ('     itemS.total ==>', itemS.total);
        }
        // console.log ('   itemL.discount ==>', itemL.discount);
        // console.log ('   itemL.total ==>', itemL.total);
        
      }

      
      if ( svcCd === 'C' ) {
        line.isMPhone   = true;
      } else if ( svcCd === 'P' ) {
        line.isTPhone   = true;
      } else if ( svcCd === 'T' ) {
        line.isIpTV     = true;
      } else if ( svcCd === 'I' ) {
        line.isInternet = true;
      } else if ( svcCd === 'F' ) {
        line.isPocket = true;
      }
      line.group  = group;
      line.totAmt = (totAmt < 0 ? '-₩' : '₩') + func.commaSeparatedString( Math.abs(totAmt) );
      line.totAmtInt = totAmt;
      line.name   = func.phoneStrToDash(name);
      return line;
  }

  public parseCommaedStringToInt(strNum) {
      return parseInt(strNum.replace(/,/g, ''), 10);
  }
  public commaSeparatedString(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
 
  /**
   * 다른 페이지를 찾고 계신가요 통계코드 생성
   * @param data
   */
  private getAppXtEid(data: any): any {
    const eid = {
      line        : 'CMMA_A10_B81_C1201_D4350-7', // 회선번호
      selectBill  : 'CMMA_A10_B81_C1201-8',       // select Bill
      miri        : 'CMMA_A10_B81_C1201-14',       // 미리
      notPhone    : 'CMMA_A10_B81_C1201_D4350-11',   // notPhone
      gotoKor     : 'CMMA_A10_B81_C1201_D4350-12',     // goKor   
      notLine     : 'CMMA_A10_B81_C1201_D4350-16',     // 회선미보유
      subLine     : 'CMMA_A10_B81_C1201_D4350-9'      // 종속회선
    };
    data.xtEid = eid;
  }
  
  private getMWebXtEid(data: any): any {
    const eid = {
      line        : 'MWMA_A10_B81_C1201_D4350-1',    // 회선번호
      selectBill  : 'MWMA_A10_B81_C1201_D4350-2',    // select Bill
      miri        : 'MWMA_A10_B81_C1201_D4350-13',    // 미리
      notPhone    : 'MWMA_A10_B81_C1201_D4350-5',     // notPhone
      gotoKor     : 'MWMA_A10_B81_C1201_D4350-6',    // goKor
      notLine     : 'MWMA_A10_B81_C1201_D4350-15',    // 회선미보유
      subLine     : 'MWMA_A10_B81_C1201_D4350-3'      // 종속회선
    };
    data.xtEid = eid;
  }
}

export default MyTFareBillGuide;
