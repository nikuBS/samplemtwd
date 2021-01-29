
/**
 * @file 리스트 < 요금제 < 상품 (고도화)
 * @author Kinam Kim (P161322)
 * @since 2020.12.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { 
  SVC_CDGROUP, SVC_ATTR_E, LOGIN_TYPE
} from '../../../../types/bff.type';
import {
  DATA_UNIT, MYT_FEEPLAN_BENEFIT
} from '../../../../types/string.type';

import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';
import { flatMap } from 'rxjs/operators';

// section sort 정보가 없을 때 기본값을 아래로 세팅하기 위해 (기본값: 테마배너, 퀵필터, 테마리스트 순)
const DEFAULT_SORT_SECTION = 'QUICK_FILTER,THEME_BANNER,THEME_LIST';

// 부가서비스 타입
enum ADDITION_TYPE {
  DEFAULT_LINK = 'DEFAULT_LINK', // 기본 링크를 제공할 때
  CUSTOM_LINK = 'CUSTOM_LINK', // 기본 링크 이외의 링크를 제공하고 싶을 때
  ACTION_SHEET = 'ACTION_SHEET' // 액션시트로 출력하고 싶을 때
}

// 단말기 방식 코드 (상품 리스트 필터값을 전달할 때 사용) 
enum QUICK_FILTER_CODES {
  'A' = 'F01122', // 2G (2G는 3G를 표현)
  'D' = 'F01122', // 2G (2G는 3G를 표현)
  'W' = 'F01122', // 3G
  'L' = 'F01121', // LTE
  'F' = 'F01713', // 5G
  'E' = 'F01124', // 태블릿/ETC (Custom)
  'P' = 'F01125', // PPS (Custom)
}

// 단말기 방식 코드
enum DEVICE_MAJOR_CODES {
  'A' = 'W', // 2G (2G는 3G를 표현)
  'D' = 'W', // 2G (2G는 3G를 표현)
  'W' = 'W', // 3G
  'L' = 'L', // LTE
  'F' = 'F', // 5G
  'E' = 'E', // 태블릿/ETC (Custom)
  'P' = 'P', // PPS (Custom)
}

// 단말기 분류 체계 코드
enum DEVICE_MINOR_CODES {
  '0102001' = 'E', // Voice or Data 가능한 tablet (태블릿/ETC 범주)
  '0202001' = 'E', // Voice 불가능한 Tablet (태블릿/ETC 범주)
  '0102000' = 'E', // 회선형 Device (태블릿/ETC 범주)
}



 // 손실보전 부가서비스 정보
const ADDITIONS_LIST = [
  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK, // 부가서비스 타입 
    'additionNm' : 'FLO 앤 데이터', // 부가 서비스 명
    'additionIconImg' : '/img/product/v2/ico-add-flo.svg', // 부가 서비스 아이콘
    'additionNoticeMsg' : '', // notice 메시지
    'additionJoined': true, // 가입하기 버튼 노출(true) 또는 확인하기 버튼 노출 (false)
    'targetPayments': [ 'NA00006404' ,'NA00006539' ,'NA00006538' ,'NA00006797' ,'NA00006157' ], // 타겟이 되는 요금제 코드 리스트
    'targetAddition': 'NA00006520', // 타겟이 되는 부가서비스 코드명
    'targetAdditionAction': '/product/mobileplan-add/join' // 타겟이 되는 부가서비스 가입 URL
  },
  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK,
    'additionNm' : 'FLO 앤 데이터 플러스',
    'additionIconImg' : '/img/product/v2/ico-add-flo.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405' ],
    'targetAddition': 'NA00006599',
    'targetAdditionAction': '/product/mobileplan-add/join'
  },
  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK,
    'additionNm' : 'wavve 앤 데이터',
    'additionIconImg' : '/img/product/v2/ico-add-wavve.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006404' ,'NA00006539' ,'NA00006538' ,'NA00006797' ,'NA00006157' ],
    'targetAddition': 'NA00006577',
    'targetAdditionAction': '/product/mobileplan-add/join'
  },
  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK,
    'additionNm' : 'wavve 앤 데이터 플러스',
    'additionIconImg' : '/img/product/v2/ico-add-wavve.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405' ],
    'targetAddition': 'NA00006584',
    'targetAdditionAction': '/product/mobileplan-add/join'
  },

  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK,
    'additionNm' : 'T가족모아데이터',
    'additionIconImg' : '/img/product/v2/ico-add-vip.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006539', 'NA00006538', 'NA00006797', 'NA00006157', 'NA00005958', 'NA00005959', 'NA00007004', 'NA00007005' ],
    'targetAddition': 'NA00006031',
    'targetAdditionAction': ''
  },
  {
    'additionType' : ADDITION_TYPE.DEFAULT_LINK,
    'additionNm' : '5G 스마트워치TAB할인(모)',
    'additionIconImg' : '/img/product/v2/ico-add-watch.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405', 'NA00006404', 'NA00006403' ],
    'targetAddition': 'NA00006484',
    'targetAdditionAction': ''
  },

  {
    'additionType' : ADDITION_TYPE.CUSTOM_LINK,
    'additionNm' : 'T멤버쉽 VIP (테스트)',
    'additionIconImg' : '/img/product/v2/ico-add-vip.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006404' ], // 패밀리 가입 가능 (테스트용^^)
    'targetAddition': '',
    'targetAdditionAction': '/membership/submain'
  },
  {
    'additionType' : ADDITION_TYPE.CUSTOM_LINK,
    'additionNm' : '분실파손보험 (테스트)',
    'additionIconImg' : '/img/product/v2/ico-add-insurance.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006404' ], // 패밀리 가입 가능 (테스트용^^)
    'targetAddition': '',
    'targetAdditionAction': '/product/mobileplan-add/list?filters=F01233'
  },
  {
    'additionType' : ADDITION_TYPE.ACTION_SHEET,
    'additionNm' : '잔여분할금면제 (테스트)',
    'additionIconImg' : '/img/product/v2/ico-add-excuse.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006404' ], // 패밀리 가입 가능 (테스트용^^)
    'targetAddition': '',
    'targetAdditionAction': ''
  },
]

export default class RenewProduct extends TwViewController {
    constructor() {
      super();
    }

    render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
      Observable.combineLatest(
        this.getMyPayment(svcInfo) // 사용중인 요금제 조회
        , this.isPiAgree(svcInfo) // 개인정보 동의 조회
        , this.getMyAdditions(svcInfo) // 사용중인 부가서비스 조회
        , this.getSortSection() // 섹션 순서 데이터를 조회
        , this.getThemeData(svcInfo) // 테마(리스트, 배너) 데이터를 조회
        , this.getQuickFilter(svcInfo) // 퀵필터 데이터를 조회
      ).subscribe(([
        payment // 사용중인 요금제 데이터 결과 값
        , isPiAgree // 개인정보 동의 여부
        , additions // 사용중인 부가서비스 결과 값
        , sortSection // 섹션 순서 데이터 결과 값
        , themeData // 테마 데이터 조회
        , quickFilter // 퀵 필터 데이터 조회
      ]) => {
        const isWireless = svcInfo ? !(SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) : false; // 무선 회선인지 체크
        const data = {
          payment, isPiAgree, additions, isWireless, sortSection, themeData, quickFilter
        }

        res.render('mobileplan/renewal/submain/product.renewal.mobileplan.html', { svcInfo, pageInfo, data });
      });
    }

    /**
     * 현재 사용중인 요금제를 조회
     * 로그인이 되어있고 선택된 회선이 있을 때 데이터를 조회할 수 있다.
     * 오직 무선 데이터 회선만 조회 가능하다.
     * 
     * 무선 요금상품(휴대폰, T pocket-fi, PPS): BFF_05_0136 (http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=56754635)
     */
    private getMyPayment ( svcInfo: any ): Observable<any> { 
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 현재 사용중인 요금제를 표현할 필요가 없음.
        return Observable.of(null);
      }

      if ( this.isCase4(svcInfo) ) { // SB의 Case4에 해당되는지 체크.
        return Observable.of(null);
      }

      return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return this.convertWirelessPlan(resp.result);
        }
        
        return null;
      });
    }

    /**
     * 개인정보 동의 여부 (personal information)
     * 로그인이 되어있고 선택된 회선이 있을 때
     */
    private isPiAgree ( svcInfo: any ): Observable<any> {
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 현재 사용중인 요금제를 표현할 필요가 없음.
        return Observable.of(false);
      }

      if ( SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0 ) { // 지금 나의 회선이 유선 회선일 경우 요금제를 표현하지 않음.
        return Observable.of(false);
      }

      return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          if (resp.result.twdInfoRcvAgreeYn === 'N') { // 개인정보 동의가 N 일 때
            return true;
          }
        }
        return false;
      });
    }

    /**
     * 사용중인 부가 서비스를 조회
     * 
     * @param svcInfo 
     */
    private getMyAdditions ( svcInfo: any ): Observable<any> { 
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 현재 사용중인 요금제를 표현할 필요가 없음.if ( FormatHelper.isEmpty(svcInfo) ) {
        return Observable.of([]);
      } 

      if ( SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0 ) { // 지금 나의 회선이 유선 회선일 경우 요금제를 표현하지 않음.
        return Observable.of([]);
      }

      // 나의 요금제에 해당되는 부가서비스의 정보를 얻기 위해서 필터 정보를 얻음
      const additionsFilter = ADDITIONS_LIST.filter(data => {
        return data.targetPayments.indexOf(svcInfo.prodId) > -1 ? true : false;
      });

      // 필터 정보가 없다면 종료.
      if ( !additionsFilter || additionsFilter.length === 0) {
        return Observable.of([]);
      }

      // 가입된 부가 서비스 정보를 얻어옴.
      return this.apiService.request(API_CMD.BFF_05_0137, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          resp.result.addProdList.filter((prod) => { // 현재 로그인된 사용자의 부가서비스의 정보를 얻고 난 뒤
            const joined = additionsFilter.find(target => target.targetAddition === prod.prodId); 
            if ( joined ) { // 가입된 부가서비스가 있는지 체크
              const index = additionsFilter.findIndex(f => f.targetAddition === joined.targetAddition);
              if ( index > -1 ) { // 가입된 부가서비스가 있으면 부가서비스에 해당되는 항목을 삭제한다
                additionsFilter.splice(index, 1);
              }
            }
          });

          return additionsFilter;
        }
      });
    }

    /**
     * 메인 화면의 섹션영역 (<section>)의 데이터를 정렬하기 위해서 먼저 환경변수 redis에서 순서 정보를 얻어옴
     */
    private getSortSection(): Observable<any> {

      // TODO: 현재는 REDIS_KEY.PRODUCT_SORT_SECTION 이 값이 없으므로 임시로 만듬^^
      return Observable.of(DEFAULT_SORT_SECTION);


      return this.apiService.request(API_CMD.BFF_01_0069, { property: REDIS_KEY.PRODUCT_SORT_SECTION }).map(resp => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result || DEFAULT_SORT_SECTION;
        }

        return null;
      });
    }

    /**
     * 테마 데이터 (테마 리스트, 테마 배너) 데이터를 조회 
     * @param svcInfo 
     */
    private getThemeData( svcInfo: any ): Observable<any> {
      return Observable.of(null);
    }
    
    /**
     * 퀵 필터 데이터를 조회
     * 
     * 현재 나의 단말기 정보를 얻어온 뒤 회선 정보에 해당되는 퀵 필터 데이터를 조회.
     * 먼저 비 로그인 상태거나 회선이 없으면 기본값으로 5G에 해당되는 퀵 필터 데이터를 조회하고
     * 회선이 있으면 해당 회선 네트워크 정보(3G, LTE, 5G, Tablet/2nd Device, PPS)를 얻어온 뒤 데이터를 조회하는 형식으로 개발
     * 
     * @param svcInfo 
     */
    private getQuickFilter( svcInfo: any ): Observable<any> {
      return Observable.of(this.getDeviceInitCode(svcInfo))
        .pipe(flatMap(p => {
          const deviceCode: any = p;

          // 로그인 여부 및 기타정보를 먼저 체크한 뒤 코드값이 없으면(로그인 되어있는 상태) 네트워크 정보를 API를 통해서 얻어온 후 다음 pipe로 데이터를 넘겨줌
          if ( FormatHelper.isEmpty(deviceCode) ) {
            return this.getDeviceCode();
          }
          
          return deviceCode;
        }))
        .pipe(flatMap(p => {
          const deviceCode: any = p;
          const filterCode = (Object.keys(QUICK_FILTER_CODES).indexOf( deviceCode ) > -1) ? QUICK_FILTER_CODES[deviceCode] : null;

          // 이 전 파이프에서 deviceCode값 또는 filterCode값이 없으면 빈 object를 넘긴다.
          if ( FormatHelper.isEmpty(deviceCode) || !filterCode ) {
            return Observable.of({});
          } 

          // TODO: 이전 파이프에서 넘긴 코드값을 바탕으로 퀵필터 API 호출
          return Observable.of({
            deviceCode: deviceCode,
            quickFilterCode: filterCode,
            quickFilterData: this.getQuickFilterData(deviceCode)
          });
        }));
    }

    /**
     * 기초 데이터 코드를 먼저 구함.
     * 
     * 로그인이 되어있지 않거나 선택된 회선이 없다면 기본값으로 5G를 출력하고, PPS 사용자면 PPS 값을 출력하고, 로그인이 되어있으면 단말기 정보 API를 호출을 해야하므로 NULL값을 리턴한다.
     * @param svcInfo 
     */
    private getDeviceInitCode( svcInfo: any ): any {
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 5G 
        return DEVICE_MAJOR_CODES.F;
      }

      if ( svcInfo.svcGr === 'P' ) { // 선택한 회선이 선불폰(PPS) 라면 P
        return DEVICE_MAJOR_CODES.P;
      }

      return null;
    }

    /**
     * 현재 나의 단말기 정보를 얻어옴
     * 
     * 통신망 정보: BFF_05_0220 (http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=112658142)
     */
    private getDeviceCode(): Observable<any> {
      return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {

          // 단말기 분류 체계코드를 검사
          if ( Object.keys(DEVICE_MINOR_CODES).indexOf( resp.result.beqpSclEqpClSysCd ) > -1 ) {
            return DEVICE_MINOR_CODES[resp.result.beqpSclEqpClSysCd];
          }

          // 단말기 방식 코드 검사
          if ( Object.keys(DEVICE_MAJOR_CODES).indexOf( resp.result.eqpMthdCd ) > -1 ) {
            return DEVICE_MAJOR_CODES[resp.result.eqpMthdCd];
          }
        }
        
        return null;
      });
    } 

    /**
     * BFF를 이용하여 퀵 필터 데이터를 얻음
     * 
     * 퀵필터 정보: BE에서 개발중..! 
     * @param code 
     */
    private getQuickFilterData( networkCode: any ): Observable<any> {
      return Observable.of([{

      }]
      );
    }


    /**
     * 무선 데이터에 해당되는 데이터에 대해 의미있는 값으로 변환
     * @param data 
     */
    private convertWirelessPlan(data): any {
      if (FormatHelper.isEmpty(data.feePlanProd)) {
        return null;
      }
      // 금액, 음성, 문자, 할인상품 값 체크
      const basFeeTxt = FormatHelper.getValidVars(data.feePlanProd.basFeeTxt);
      const basOfrVcallTmsCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrVcallTmsTxt);
      const basOfrCharCntCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrLtrAmtTxt);
      
      // 데이터 값 변환
      const basDataGbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataGbTxt);
      const basDataMbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataMbTxt);
      const basDataTxt = this.convertBasDataTxt(basDataGbTxt, basDataMbTxt);

      // 상품 스펙 공통 헬퍼 사용하여 컨버팅
      const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

      return {
        product: FormatHelper.isEmpty(data.feePlanProd) ? null : {
          isProductShow: !!(spec.basOfrDataQtyCtt || spec.basOfrVcallTmsCtt || spec.basOfrCharCntCtt), // 데이터, 음성, 문자 데이터 중 하나라도 존재하면 데이터, 음성, 문자를 출력한다
          basProductNm: data.feePlanProd.prodNm, // 상품명
          basFeeInfo: spec.basFeeInfo,  // 금액
          basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
          basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
          basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
        }
      }
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
      return [...this.sortByHigher(dcTypeMoneyList), ...this.sortByHigher(dcTypePercentList)]
        .map(benefit => {
          benefit.penText = (benefit.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N; // 위약금 여부
          benefit.dcStaDt = DateHelper.getShortDateWithFormat(benefit.dcStaDt, 'YYYY.M.D.'); // 할인기간 (시작)
          benefit.dcEndDt = (benefit.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(benefit.dcEndDt, 'YYYY.M.D.') : MYT_FEEPLAN_BENEFIT.ENDLESS;  // 할인기간 (끝)
          benefit.dcVal = benefit.dcCttClCd === '01' ? FormatHelper.addComma(benefit.dcVal.toString()) : benefit.dcVal; // 할인 값
          return benefit;
        });
    }

    /**
     * 데이터 컨버터 함수
     * @param basDataGbTxt 
     * @param basDataMbTxt 
     */
    private convertBasDataTxt(basDataGbTxt, basDataMbTxt): any {
      if (!FormatHelper.isEmpty(basDataGbTxt)) {  // GB 값 우선 사용
        return {
          txt: basDataGbTxt,
          unit: DATA_UNIT.GB
        };
      }
    
      if (!FormatHelper.isEmpty(basDataMbTxt)) {  // GB 없고 MB 있으면 값 사용
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
     * 요금제 중 가장 비싼 요금제를 리스트 상 상단으로 올리는 함수
     * @param list 
     */
    private sortByHigher(list: Array<any>): Array<any> {
      return list.sort((itemA, itemB) => (itemA.dcVal > itemB.dcVal) ? -1 : (itemA.dcVal < itemB.dcVal) ? 1 : 0);
    }

    /**
     * SB의 Case4에 해당되는 조건인지 체크  ( case4의 조건은 유선사용자 또는 법인 사용자 )
     * 
     * [참고] 서비스 등급기준 코드 (svcInfo.svcGr) => 법인 실사용 (R), SKT 법인 (D), 법인 실사용+비회선(E), 기업솔루션 (O), PPS (P)
     * @param svcInfo 
     */
    private isCase4(svcInfo) {
      return (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) || (['R', 'D', 'E', 'O'].indexOf(svcInfo.svcGr) >= 0);
    }

    /**
     * Admin 에서 등록한 이미지에 대한 CDN 정보
     * @param 
     */
    private getCDN() {
      const env = String(process.env.NODE_ENV);
      if ( env === 'prd' ) { // 운영
        return { CDN: 'https://cdnm.tworld.co.kr' };
      } else if ( env === 'stg' ) { // 스테이징
        return { CDN: 'https://cdnm-stg.tworld.co.kr' };
      } else { // local, dev
        return { CDN: 'https://cdnm-dev.tworld.co.kr' };
      }
    }

}