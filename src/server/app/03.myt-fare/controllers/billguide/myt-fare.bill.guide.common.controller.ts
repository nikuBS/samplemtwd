import {Request, Response} from 'express';
import CommonHelper from '../../../../utils/common.helper';
import {API_CMD, API_CODE, API_VERSION} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_SUBMAIN_TITLE} from '../../../../types/title.type';
import {MYT_FARE_BILL_GUIDE, MYT_JOIN_WIRE_SVCATTRCD} from '../../../../types/string.type';
import StringHelper from '../../../../utils/string.helper';
import {SVC_CDNAME} from '../../../../types/bff.type';

/**
 * MenuName: 나의 요금 > 서브메인(MF2)
 * @file myt-fare.bill.guide.common.controller.ts
 * @author 양정규
 * @since 2020.09.07
 */

// 공통데이터
interface CommDataInfo {
  selClaimDt: string; // 선택 청구 월 | 2017년 10월
  selClaimDtM: string; // 선택 청구 월 | number
  selStaDt: string; // 선택시작
  selEndDt: string; // 선택끝
  discount: string; // 할인액
  joinSvcList: any; // 가입 서비스 리스트
  useAmtTot: string; // 사용요금

  intBillLineList: any; // 조건변경 > 회선
  conditionChangeDtList: any; // 조건변경 > 기간
  repSvcNm: string; // 대표서비스회선정보

  prodNm: string; // pps 요금제
  prodAmt: string; // pps 잔액
  useEndDt: string; // pps 발신/사용기간
  dataKeepTrmDt: string; // pps 수신/데이터유지기간
  numKeepTrmDt: string; // pps 번유지기간
  curDt: string; // 현재날짜
  remained: string; // 잔여데이터 KB | 공백일 경우 표시안함
  dataYn: string; // 음성+데이터 'Y'
  dataProdYn: string; // MB 'Y' | 원 'N'

  ppsType: string; // pps 요금제 종류 'A'; 'B'; 'C'
  ppsProdAmt: string; // 카드잔액(원/mb)
  ppsRemained: string; // 잔여대이터(kb)
  ppsObEndDt: string; // 발신종료일자
  ppsInbEndDt: string; // 수신종료일자
  ppsNumEndDt: string; // 번호유지종료일자
  ppsCurDate: string; // 현재시간
  ppsStartDateVal: string;
  ppsStartDateTxt: string;
  ppsEndDateVal: string;
  ppsEndDateTxt: string;
  svcType: string;
}

interface ReqQuery {
  line: string;
  date: string;
}

interface Info {
  svcInfo: any;
  pageInfo: any;
  reqQuery: ReqQuery;
  childInfo: any;
  allSvc: any;
}

abstract class MytFareBillGuideCommonController extends TwViewController {
  get info(): Info {
    return this._info;
  }

  set info(value: Info) {
    this._info = value;
  }
  constructor() {
    super();
  }

  // 쿼리스트링
  protected pageInfo: any;
  protected svcInfo: any;
  private _info;

  protected _urlTplInfo: any = {
    commonPage: 'billguide/myt-fare.bill.guide.html', // 공통 페이지
    prepaidPage: 'billguide/myt-fare.bill.guide.pps.html', // PPS(선불폰)
    // NOTE: OP002-8156: 아래 회선은 구할 수 없음 (확인: 문종수)
    // companyPage: 'billguide/myt-fare.bill.guide.solution.html', // 기업솔루션(포인트캠)
    // NOTE: OP002-8156: 아래 회선은 모바일에서 값을 보여줄 수 없음 (확인: 문종수)
    skbroadbandPage: 'billguide/myt-fare.bill.guide.skbd.html' // sk브로드밴드(인터넷/IPTV/집전화)
  };

  private getMonth(date: string, format: string) {
    return date && DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'days', format ) || '';
  }

  /**
   * @desc 청구 년월 구하기
   * @param date
   * @private
   */
  private getSelClaimDt(date: string) {
    return this.getMonth(date, MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE);
  }

  /**
   * @desc 청구 년월 구하기
   * @param date
   * @private
   */
  private getSelClaimDtM (date: string) {
    return this.getMonth(date, 'M');
  }

  /**
   * @desc 월 시작일 구하기
   * @param date
   * @private
   */
  private getSelStaDt (date: string) {
    return date && DateHelper.getStartOfMonDate( date, 'YYYY.M.D.') || '';
  }

  /**
   * @desc 월 끝나는 일 구하기
   * @param date
   * @private
   */
  private getSelEndDt (date: string) {
    return date && DateHelper.getEndOfMonDate( date, 'YYYY.M.D.') || '';
  }

  private getAllSvcItem(allSvc: any, svcMgmtNum: string) {
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
   * 이름으로 svcType을 리턴
   * svcType = 휴대폰, 선불폰, T pocket Fi, T Login, T Wibro, 인터넷, IPTV, 집전화, 포인트캠
   * @param nm
   */
  private getSvcType(nm: string) {
    const replace = (val => {
      return val.replace(/ /g, '').toLowerCase();
    });

    nm = replace(nm);
    const {M1, M2, M3, M4, M5, S1, S2, S3, O1} = MYT_JOIN_WIRE_SVCATTRCD;
    const {PHONE_TYPE_0, TEL_TYPE_1} = MYT_FARE_BILL_GUIDE;
    // svcType
    if ( nm.indexOf(M1) + nm.indexOf(PHONE_TYPE_0) > -2) { // 이동전화
      return M1;   // 휴대폰
    } else if ( nm.indexOf(M2) !== -1) {
      return M2;      // 선불폰

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return M3;      // T pocket Fi

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return M4;      // T Login

    } else if ( nm.indexOf(replace(M5)) !== -1) {
      return M5;      // T Wibro

    } else if ( nm.indexOf(S1) !== -1) {
      return S1;      // 인터넷

    } else if ( nm.indexOf(S2.toLowerCase()) !== -1) {
      return S2;      // TV

    } else if ( nm.indexOf(S3) + nm.indexOf(TEL_TYPE_1) > -2 ) {
      return S3;      // 집전화

    } else if ( nm.indexOf(O1) !== -1) {
      return O1;      // 포인트캠
    }
    return '';
  }

  /**
   * 회선정보 목록 리턴
   * @param allSvc
   * @return {svcType: '전체'} + 회선정보 목록
   */
  private intBillLineFun(allSvc: any, intBillLineInfo: any) {
    if (!intBillLineInfo) {
      return null;
    }
    intBillLineInfo.forEach(item => {
      const svcItem = this.getAllSvcItem(allSvc, item.svcMgmtNum);
      const {name} = item;
      Object.assign(item, {
        svcType: this.getSvcType(name),
        label: name.substring(name.indexOf('(') + 1, name.indexOf(')') )
      });

      const {M1, M2, M3, M4, S3} = MYT_JOIN_WIRE_SVCATTRCD;
      [M1, M2, M3, M4, S3].forEach(attrNames => {
        if (item.svcType === attrNames) {
          item.label = this.phoneStrToDash(svcItem ? svcItem.svcNum : item.label);
        }
      });

    });
    intBillLineInfo.unshift({ svcType: MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE } );
    return intBillLineInfo;
  }

  // 별표가 있는 휴대폰 번호 대시 적용
  private phoneStrToDash(strCellphoneNum: string): string {
    if ( !strCellphoneNum ) {
      return '';
    }
    // return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
    return StringHelper.phoneStringToDash(strCellphoneNum.replace(/-/g, ''));
  }

  /**
   * 조회조건 날짜 목록을 리턴
   * 날짜는 모두 말일 -> +1일해서 다음 월로 리턴
   */
  private conditionChangeDtListFun(invDtArr: Array<string>) {
    if (!invDtArr) {
      return null;
    }
    return invDtArr.map(item => {
      return this.getMonth(item, MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE);
    });
  }

  /**
   * 통합(대표)청구화면에서 (총 청구요금 하단) 회선,금액 목록 데이터를 금액:포맷팅, 서비스명:통일 해서 리턴
   */
  private paidAmtSvcCdListFun(paidAmtSvcCdList: any[] = []) {
    return paidAmtSvcCdList.map(item => {
      const {PHONE_TYPE_0, PHONE_TYPE_1, TEL_TYPE_0, TEL_TYPE_1} = MYT_FARE_BILL_GUIDE;
      item.amt = FormatHelper.addComma(item.amt);
      // 이동전화 -> 휴대폰
      item.svcNm = item.svcNm === PHONE_TYPE_0 ? PHONE_TYPE_1 : item.svcNm;
      // 유선전화 -> 집전화
      item.svcNm = item.svcNm === TEL_TYPE_1 ? TEL_TYPE_0 : item.svcNm;
      return item;
    });
  }
  
  private defaultCommDataInfo(): CommDataInfo {
    return {
      selClaimDt: '', // 선택 청구 월 | 2017년 10월
      selClaimDtM: '', // 선택 청구 월 | number
      selStaDt: '', // 선택시작
      selEndDt: '', // 선택끝
      discount: '', // 할인액
      joinSvcList: [], // 가입 서비스 리스트
      useAmtTot: '', // 사용요금

      intBillLineList: [], // 조건변경 > 회선
      conditionChangeDtList: [], // 조건변경 > 기간
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
      ppsEndDateTxt: '',
      svcType: ''
    };
  }

  /**
   * @param req
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   * @desc 초기 설정
   */
  protected init(req: Request, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    CommonHelper.addCurLineInfo(svcInfo);
    allSvc = allSvc || { 's': [], 'o': [], 'm': [] };
    this.info = {
      svcInfo,
      pageInfo,
      reqQuery: Object.assign({
        line: '',
        date: ''
      }, req.query),
      childInfo,
      allSvc
    };
  }

  protected renderView(res: Response, view: string, data: any): any {
    if (data.data) {
      data.data.allSvc = this.getAllSvcClone(data.data.allSvc);
    }
    res.render(view, data);
  }

  /**
   * allSvc에서 필요한 정보만 복사
   * @param allSvc
   */
  private getAllSvcClone(allSvc: any) {
    if ( !allSvc ) {
      return null;
    }
    const {m, s, o} = allSvc;
    return {
      'm': this.copyArr(m),
      's': this.copyArr(s),
      'o': this.copyArr(o)
    };
  }
  private copyArr(arr: Array<any>) {
    if ( !arr ) {
      return arr;
    }

    const copyObj = (obj: any, keys: Array<any>) => {
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
    };
    const tmpArr: Array<any> = [];
    for ( let i = 0 ; i < arr.length; i++ ) {
      tmpArr.push(copyObj(arr[i], ['svcMgmtNum', 'prodId', 'prodNm']));
    }
    return tmpArr;
  }

  /**
   * 대표청구회선이 SK브로드밴드인 경우
   */
  protected skbroadbandCircuit(res) {
    const {svcInfo, pageInfo} = this.info;
    this.renderView(res, this._urlTplInfo.skbroadbandPage, {
      svcInfo,
      pageInfo
    });
  }

  /**
   * PPS 선불폰
   */
  protected getPrepaidCircuit(): Observable<any> {
    const {pageInfo, svcInfo, reqQuery} = this.info;
    return this.apiService.request(API_CMD.BFF_05_0013, {invDt: reqQuery.date})
      .map((resp) => {
        if (resp.code !== API_CODE.CODE_00) {
          // this.fail(res, resp);
          return resp;
        }
        
        const ppsInfo = resp.result;
        const _ppsType = {
          NY: 'A', // 데이터 요금제 'A'
          NN: 'B', // 데이터 요금제 'B'
          YN: 'C', // 데이터 요금제 'C'
        };

        // 과거 월 조회
        const getPrevMonth = ( (prevMon: string, formatStr: string) => {
          // return moment().subtract('1', 'months').startOf('month').format(formatStr);
          return DateHelper.getStartOfMonSubtractDate(undefined, prevMon, formatStr);
        });

        const {dataYn, dataOnlyYn, prodAmt, remained, obEndDt, inbEndDt, numEndDt} = ppsInfo;
        const commDataInfo: CommDataInfo = Object.assign(this.defaultCommDataInfo(), {
          ppsType : _ppsType[dataYn + dataOnlyYn],
          ppsProdAmt : FormatHelper.addComma(prodAmt),
          ppsRemained : FormatHelper.addComma(remained),
          ppsObEndDt : DateHelper.getShortDate(obEndDt),
          ppsInbEndDt : DateHelper.getShortDate(inbEndDt),
          ppsNumEndDt : DateHelper.getShortDate(numEndDt),
          ppsCurDate : DateHelper.getCurrentDateTime('YYYY.M.D. hh:mm'),
          ppsStartDateVal : getPrevMonth('2', 'YYYYMM'),
          ppsStartDateTxt : getPrevMonth('2', 'YYYY.M.'),
          ppsEndDateVal : getPrevMonth('1', 'YYYYMM'),
          ppsEndDateTxt : getPrevMonth('1', 'YYYY.M.')
        });

        return {
          reqQuery,
          svcInfo,
          pageInfo,
          ppsInfo,
          commDataInfo
          // data: allSvc // 2020.02.06 미사용으로 삭제함.
        };
      });
  }

  /**
   * @desc 청구요금 조회
   * @protected
   */
  protected getBillCharge(svcInfo: any, res: Response): Observable<any> {
    const {actCoClCd, svcAttrCd} = svcInfo;
    // SK브로드밴드 가입
    if ( actCoClCd === 'B' ) {
      return Observable.of({
        lineType: SVC_CDNAME.S1
      });
    } else if ( svcAttrCd === 'M2' ) { // PPS(선불폰)
      return this.getPrepaidCircuit().map(resp => {
        resp.lineType = SVC_CDNAME.M2;
        return resp;
      });
    } else {
      return this.getCharge();
    }
  }

  /**
   * @desc 청구요금 조회
   * @protected
   */
  private getCharge(): Observable<any> {
    const {reqQuery, svcInfo} = this.info;
    // 청구요금 조회 : 대표청구 여부(svcInfo.actRepYn) Y인 경우
    const BFF_ID = svcInfo.actRepYn === 'Y' ? API_CMD.BFF_05_0036 : API_CMD.BFF_05_0047;
    return this.apiService.request(BFF_ID, {
      invDt: reqQuery.date,
      selSvcMgmtNum: reqQuery.line
    }, null, [], API_VERSION.V2).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        // this.fail(res, resp);
        return resp;
      }
      return this.parseCharge(resp);
    });
  }

  /**
   * 청구요금 조회 응답 처리
   * @protected
   */
  protected parseCharge(res): any {
    const {pageInfo, svcInfo, allSvc, reqQuery, childInfo: childLineInfo} = this.info;
    try {
      const {result} = res;
      // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
      if (res.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(result)) {
        return this.noData();
      }

      // OP002-2986 로 청구 데이터 안들어올 수 있으므로 디폴트 세팅 해준다.
      let billpayInfo: any = {
        invDt: ''
      };
      let useFeeInfo: any = {};
      const commDataInfo: CommDataInfo = this.defaultCommDataInfo();
      let intBillLineInfo = [];
      let typeChk: string;
      const existBill = (listName) => {
        const obj = billpayInfo;
        return obj.useAmtTot !== 0 || (obj[listName] || []).length > 0;
      };

      // 대표 청구 회선 인 경우
      if ( svcInfo.actRepYn === 'Y' ) {
        billpayInfo = Object.assign({
          invDt: '',
          totInvAmt: '',
          dcAmt: '',
          invSvcList: [],
          paidAmtSvcCdList: [],
          paidAmtDetailList: []
        }, result);
        const {invSvcList} = billpayInfo;

        // 청구 요금 데이터
        if ( invSvcList.length > 0) {
          // 청구 회선, 날짜 목록
          intBillLineInfo = Object.assign([], invSvcList[0]['svcList']);
          billpayInfo['invDtArr'] = invSvcList.map(item => item.invDt);
        }
        commDataInfo.intBillLineList = this.intBillLineFun(allSvc, intBillLineInfo);

        // 조회일자에 맞는 서비스리스트
        const daySvcList = invSvcList.find(item => item.invDt === billpayInfo.invDt) || {};
        // 사용요금/청구요금이 존재하는지
        billpayInfo.existBill = existBill('paidAmtDetailList');
        // 개별청구 회선
        if ( (daySvcList.svcList || []).length === 1 ) {
          typeChk = 'A4';
        } else { // 통합청구 회선
          // 조회시 대표청구회선이거나 || 세션이 대표청구회선이면서 조회회선을 조회했을 경우. 아래는 이전 조건인데 svcInfo.actRepYn === 'Y' 이게 무조건 타는데
          // 아래와 같이 한 이유를 모르겠음.. 주석처리함.
          // if ( svcInfo.actRepYn === 'Y' || (svcInfo.actRepYn === 'Y' && reqQuery.line) )
          typeChk = 'A5';
          commDataInfo.joinSvcList = (!reqQuery.line) ? this.paidAmtSvcCdListFun(billpayInfo.paidAmtSvcCdList) : null;
        }

      } else {
        // OP002-2986 로 청구 데이터 안들어올 수 있으므로 디폴트 세팅 해준다.
        useFeeInfo = Object.assign({
          repSvcNm: '',
          invAmtList: [],
          unPayAmtList: [],
          unPaidTotSum: []
        }, result);
        const {invAmtList} = useFeeInfo;
        // 현재는 param이 없지만 추후 추가를 위해 넣어둠
        if ( invAmtList.length > 0) {
          // 사용 요금 데이터(조회한 날짜로 찾음)
          billpayInfo = invAmtList.find(item => item['invDt'] === reqQuery.date) || invAmtList[0];
          // 사용 날짜 목록
          billpayInfo['invDtArr'] = invAmtList.map(item => item['invDt']);
        }
        commDataInfo.repSvcNm = FormatHelper.conTelFormatWithDash(useFeeInfo.repSvcNm);  // 통합청구대표 이름
        commDataInfo.svcType = this.getSvcType(billpayInfo.usedAmountDetailList[0].svcNm);  // 서비스 타입(한글)

        typeChk = 'A6';
        // 사용요금/청구요금이 존재하는지
        billpayInfo.existBill = existBill('usedAmountDetailList');
      }

      // 청구 시작, 종료일
      const {invDt, totInvAmt, dcAmt} = billpayInfo;
      Object.assign(commDataInfo, {
        selClaimDt : this.getSelClaimDt(invDt),
        selClaimDtM : this.getSelClaimDtM(invDt),
        selStaDt : this.getSelStaDt(invDt),
        selEndDt : this.getSelEndDt(invDt),
        // 총 요금, 할인요금
        useAmtTot: FormatHelper.addComma(totInvAmt.replace(/,/g, '')),
        discount: FormatHelper.addComma(String(Math.abs(Number(dcAmt.replace(/,/g, ''))))),
        // 청구 날짜 화면 출력 목록 (말일 날짜지만 청구는 다음달이기 때문에 화면에는 다음 월로 나와야함)
        conditionChangeDtList: this.conditionChangeDtListFun(billpayInfo.invDtArr)
      });
      const {svcMgmtNum, svcAttrCd} = svcInfo;

      // this.reqButtonView(res, this._urlTplInfo.commonPage, data);
      return {
        data : {
          reqQuery,
          svcMgmtNum,
          svcAttrCd,
          allSvc,
          billpayInfo,
          commDataInfo,
          intBillLineInfo,
          childLineInfo
        },
        typeChk,
        svcInfo,
        pageInfo
        // useFeeInfo
      };

    } catch ( e )  {
      this.logger.error(this, e);
      return this.noData();
    }
  }

  protected noData(): any {
    return {
      title: 'title',
      code: API_CODE.CODE_500,
      msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA
    };
  }

  /**
   * API Response fail
   * @param res
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  protected fail(res: Response, data: any): any {
    const {svcInfo, pageInfo} = this.info;
    return this.error.render(res, {
      code: data.code,
      msg: data.msg,
      pageInfo,
      svcInfo
    });
  }
}

export default MytFareBillGuideCommonController;
