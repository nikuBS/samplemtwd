
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

// section sort 정보가 없을 때 기본값을 아래로 세팅하기 위해 (기본값: 테마배너, 테마리스트 순)
const DEFAULT_SORT_SECTION = 'THEME_LIST,THEME_BANNER';

// 부가서비스 타입
enum ADDITION_TYPE {
  DEFAULT_LINK = 'DEFAULT_LINK', // 기본 링크를 제공할 때
  CUSTOM_LINK = 'CUSTOM_LINK', // 기본 링크 이외의 링크를 제공하고 싶을 때
  ACTION_SHEET = 'ACTION_SHEET' // 액션시트로 출력하고 싶을 때
}

// 단말기 방식 코드 (상품 리스트 필터값을 전달할 때 사용) 
enum DEVICE_FILTER_CODES {
  'A' = 'F01122', // 2G (2G는 3G를 표현)
  'D' = 'F01122', // 2G (2G는 3G를 표현)
  'W' = 'F01122', // 3G
  'L' = 'F01121', // LTE
  'F' = 'F01713', // 5G
  'E' = 'F01124', // 태블릿/ETC (Custom)
  'P' = 'F01125', // PPS (Custom)
}

// 단말기 방식 코드
enum DEVICE_CODES {
  'A' = 'W', // 2G (2G는 3G를 표현)
  'D' = 'W', // 2G (2G는 3G를 표현)
  'W' = 'W', // 3G
  'L' = 'L', // LTE
  'F' = 'F', // 5G
  'E' = 'E', // 태블릿/2nd Device (Custom)
  'P' = 'P', // PPS (Custom)
}

// 단말기 코드 명
enum DEVICE_CODE_NAME {
  'W' = '3G',
  'L' = 'LTE', 
  'F' = '5G', 
  'E' = '2ndDevice', 
  'P' = 'PPS'
}

// 필터 스타일 코드
enum FILTER_STYLE_CODES {
  'F01122' = 'i-tag-cr4', // 3G (3G는 Band 임)
  'F01121' = 'i-tag-cr2', // LTE
  'F01713' = 'i-tag-cr1', // 5G
  'F01124' = 'i-tag-cr3', // 2ndDevice 
}

// 필터 코드 문구 변경
enum FILTER_REPLACE_TEXTS {
  'F01124' = '스마트기기', // 태블릿/스마트기기 => 스마트기기
  'F01162' = '어린이/청소년', // 만 18세 이하 => 어린이/청소년
  'F01165' = '대학생/군인', // 만 24세 이하 => 대학생/군인
  'F01163' = '시니어', // 만 65세 이상 => 시니어
  'F01161' = '' // '나이제한없음' 텍스트는 화면에 표현하지않음.
}

// 리스트 형 테마코드
enum LIST_THEME_CODE {
  'TAG0000212' = 'TAG0000212', // 기본 형
  'TAG0000213' = 'TAG0000213', // 데이터 강조형
  'TAG0000214' = 'TAG0000214', // 혜택 강조형
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
      
        Observable.combineLatest(this.getLine(svcInfo)).subscribe((line) => {
          line = line[0];

          Observable.combineLatest(
            this.getMyPayment(svcInfo) // 사용중인 요금제 조회
            , this.isPiAgree(svcInfo) // 개인정보 동의 조회
            // , this.getMyAdditions(svcInfo) // 사용중인 부가서비스 조회
            , this.getSortSection(line) // 섹션 순서 데이터를 조회
            , this.getThemeListData(svcInfo, line) // 리스트 형 테마 데이터를 조회
            , this.getMyAge(svcInfo) // 나의 나이를 리턴받음

            , this.isCompareButton(line, svcInfo) // 비교하기 버튼 출력 여부
          ).subscribe(([
            payment // 사용중인 요금제 데이터 결과 값
            , isPiAgree // 개인정보 동의 여부
            // , additions // 사용중인 부가서비스 결과 값 (사용안함..)
            , sortSection // 섹션 순서 데이터 결과 값
            , themeListData // 테마 리스트 데이터 조회
            , myAge // 내 회선에 대한 나의 만 나이

            , isCompareButton // 비교하기 버튼 출력 여부
          ]) => {
            const isWireless = svcInfo ? !(SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) : false; // 무선 회선인지 체크
            const data = {
              line, payment, isPiAgree, isWireless, sortSection, themeListData, myAge, isCompareButton, cdn: this.getCDN()
            }
            
            console.log("#####");
            console.log(svcInfo);
            console.log(data);
            console.log("#####");

            res.render('mobileplan/renewal/submain/product.renewal.mobileplan.html', { svcInfo, pageInfo, data });
          });
        });
    }

    /**
     * 나의 회선 데이터 조회
     * @param svcInfo 
     */
    private getLine( svcInfo: any): Observable<any> {
      return Observable.of(this.getDeviceInitCode(svcInfo))
        .pipe(flatMap(p => {
          const deviceCode: any = p;

          // 로그인 여부 및 기타정보를 먼저 체크한 뒤 코드값이 없으면(로그인 되어있는 상태) 네트워크 정보를 API를 통해서 얻어온 후 다음 pipe로 데이터를 넘겨줌
          if ( FormatHelper.isEmpty(deviceCode) ) {
            return this.getDeviceCode( svcInfo );
          }
          
          return deviceCode;
        }))
        .pipe(flatMap(p => {
          const deviceCode: any = p;
          const filterCode = (Object.keys(DEVICE_FILTER_CODES).indexOf( deviceCode ) > -1) ? DEVICE_FILTER_CODES[deviceCode] : null;

          // 이 전 파이프에서 deviceCode값 또는 filterCode값이 없으면 기본값을 넘긴다.
          if ( FormatHelper.isEmpty(deviceCode) || !filterCode ) {
            return Observable.of({
              deviceCode: DEVICE_CODES.F,
              quickFilterCode: DEVICE_FILTER_CODES.F,
            });
          } 

          return Observable.of({
            deviceCode: deviceCode,
            quickFilterCode: filterCode,
          });
        }));
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
     * 
     * @param line 
     */
    private getSortSection(line): Observable<any> {
      let redisKey = '';
      switch ( line.deviceCode ) {
        case DEVICE_CODES.W: // 통신망이 3G
          redisKey = REDIS_KEY.PRODUCT_SORT_SECTION_3G;
          break;
        case DEVICE_CODES.L: // 통신망이 LTE
        redisKey = REDIS_KEY.PRODUCT_SORT_SECTION_LTE;
          break;
        case DEVICE_CODES.F: // 통신망이 5G
          redisKey = REDIS_KEY.PRODUCT_SORT_SECTION_5G;
          break;
        case DEVICE_CODES.E: // 통신망이 Tablet/2nd Device
          redisKey = REDIS_KEY.PRODUCT_SORT_SECTION_2ND_DEVICE;
          break;
        default: // 그 이외의 장치들은 모두 5G
          redisKey = REDIS_KEY.PRODUCT_SORT_SECTION_5G;
          break;
      }

      return this.apiService.request(API_CMD.BFF_01_0069, { property: redisKey }).map(resp => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result || DEFAULT_SORT_SECTION;
        }

        return DEFAULT_SORT_SECTION;
      });
    }

    /**
     * 리스트 형 테마 데이터 데이터를 조회 
     * @param svcInfo 
     */
    private getThemeListData( svcInfo, line ): Observable<any> {
      return this.apiService.request(API_CMD.BFF_10_0204, { 'networkName' : this.getThemeNetworkName(line) }).map((resp) => {
        if (resp.code === API_CODE.CODE_00 ) {
          if ( this.isObjectEmpty(resp.result) || !resp.result.prodList ) { // 객체 데이터가 존재하는지 체크
            return null;
          }

          let definedfilterCodes: any = Object.keys(LIST_THEME_CODE);
          let respFilterCodes: any = resp.result.tagInfo.split(',');
          let themeTypeCode = definedfilterCodes.find(filter => respFilterCodes.includes(filter)) || null; // definedfilterCodes과 respFilterCodes의 교집합 코드값을 얻음.
          
          if ( themeTypeCode ) {
            return Object.assign({
              'expsTitNm' : resp.result.expsTitNm,
              'networkType' : resp.result.networkType,
              'themeTypeCode' : themeTypeCode, // 기본형: TAG0000212, 데이터 강조형: TAG0000213, 혜택 강조형: TAG0000214
              'mblBgImgUrl' : this.getCDN() + resp.result.mblBgImgUrl,
              'mblBgImgNm' : resp.result.mblBgImgNm,
            }, {
              'prodList': this.convertThemePayment(svcInfo, resp)
            })
          }
          
          return null;
        }
      });
    }

    /**
     * 로그인 된 사용자의 만 나이를 리턴 받음.
     * 
     * 로그인이 되어있지않다면 만 나이를 0세로 리턴받음. 0세로 리턴받는 이유는 모든 테마를 보여야하는 항목들이 있기때문에 그것을 보여주기 위해서
     * @param svcInfo 
     */
    private getMyAge ( svcInfo ): Observable<any> {
      if ( FormatHelper.isEmpty(svcInfo) ) { // 로그인이 되어있지 않다면 만 나이는 0세로 세팅
        return Observable.of(0);
      }

      return this.apiService.request(API_CMD.BFF_08_0080, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result.age; // 만 나이를 리턴
        }

        return 0;
      });
    } 
    

    /**
     * 기초 데이터 코드를 먼저 구함.
     * 
     * 로그인이 되어있지 않거나 선택된 회선이 없다면 기본값으로 5G를 출력하고, PPS 사용자면 PPS 값을 출력하고, 로그인이 되어있으면 단말기 정보 API를 호출을 해야하므로 NULL값을 리턴한다.
     * @param svcInfo 
     */
    private getDeviceInitCode( svcInfo: any ): any {
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 5G 
        return DEVICE_CODES.F;
      }

      if ( svcInfo.svcGr === 'P' ) { // 선택한 회선이 선불폰(PPS) 라면 P
        return DEVICE_CODES.P;
      }

      return null;
    }

    /**
     * 현재 나의 단말기 정보를 얻어옴
     * 
     * 통신망 정보: BFF_05_0220 (http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=112658142)
     */
    private getDeviceCode( svcInfo: any ): Observable<any> {
      return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {

          // 중 분류 코드가 휴대폰이 아닌경우는 모두 'PPS/2nd Device' 장비
          if ( resp.result.beqpMclEqpClSysCd !== '0101000' ) {
            return DEVICE_CODES.E;
          }

          // 단말기 방식 코드 검사
          if ( Object.keys(DEVICE_CODES).indexOf( resp.result.eqpMthdCd ) > -1 ) {
            return DEVICE_CODES[resp.result.eqpMthdCd];
          }
        }
        
        return DEVICE_CODES.E; // 코드에 해당되는 데이터가 없으면 E로 세팅
      });
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
     * 네트워크 정보를 파싱
     * @param prodFltList 
     */
    private convertBasNetwork(prodFltList): any {
      if ( !prodFltList ) {
        return [];
      }

      return prodFltList.reduce((arr, item) => {
        // 기존에 사용하던 문구를 FILTER_REPLACE_TEXTS에 해당되는 문구로 변경해달라는 요구사항이 있었음.
        item.prodFltNm = Object.keys(FILTER_REPLACE_TEXTS).indexOf(item.prodFltId) > -1 ? FILTER_REPLACE_TEXTS[item.prodFltId] : item.prodFltNm;

        arr.push(Object.assign(item, {
          'style': FILTER_STYLE_CODES[item.prodFltId] || 'i-tag-cr5' // 필터 스타일에 맞는 class를 지정해주며, 필터스타일에 포함되지 않는 스타일들은 모두 i-tag-cr5 으로 설정
        }));
        return arr;
      }, []);
    }

    /**
     * 부가서비스 정보를 파싱
     * @param benfProdList 
     */
    private convertAdditionalList(benfProdList): any {
      if ( !benfProdList ) {
        return [];
      }
      
      return benfProdList.reduce((obj, item) => { 
        const benfNm = (item.expsBenfNm + ' ' + item.benfDtlCtt); // 부가서비스 상품명
        const benfAmtPrice = this.convProductBenefitInfo(item.benfAmt); // 혜택원가
        const useAmtPrice = this.convProductBenefitInfo(item.useAmt); // 이용금액

        const changedItem = Object.assign(item, {
          benfNm, benfAmtPrice, useAmtPrice
        })

        if ( item.prodBenfTypCd === '01' ) {  // 기본 혜택
          obj.basicBenefitsArr.push(changedItem);
        } else if ( item.prodBenfTypCd === '02' ) { // 추가 혜택 
          obj.additionalBenefitsArr.push(changedItem);
        }
        
        return obj;
      }, {
        basicBenefitsArr: [], // 기본혜택에 대한 배열
        additionalBenefitsArr: [] // 추가혜택에 대한 배열
      });
    }

    /**
     * 테마 요금제에 해당되는 데이터에 대해 의미있는 값으로 변환
     * @param data 
     */
    private convertThemePayment(svcInfo, data): any {
      return data.result.prodList.filter(item => {
        if ( !svcInfo ) {
          return item;
        }

        if ( svcInfo.prodId !== item.prodId ) { // 내 요금제와 테마요금제 리스트 중 동일한 상품이 있으면 건너뜀.
          return item;
        }
      }).reduce((arr, item) => {
        const basFeeTxt = FormatHelper.getValidVars(item.basFeeInfo); // 이용요금
        const basOfrVcallTmsCtt = FormatHelper.getValidVars(item.basOfrVcallTmsCtt); // 음성 제공량
        const basOfrCharCntCtt = FormatHelper.getValidVars(item.basOfrCharCntCtt); // 문자 제공량

        const basDataGbTxt = FormatHelper.getValidVars(item.basOfrGbDataQtyCtt); // 데이터 제공량 (GB)
        const basDataMbTxt = FormatHelper.getValidVars(item.basOfrMbDataQtyCtt); // 데이터 제공량 (MB)
        const basDataTxt = this.convertBasDataTxt(basDataGbTxt, basDataMbTxt); // GB, MB 컨버터

        const basNetworkList = this.convertBasNetwork(item.prodFltList) || []; // 네트워크값을 파싱
        const basAdditionalObject = this.convertAdditionalList(item.benfProdList) || []; // 부가 서비스 정보를 파싱

        // 상품 스펙 공통 헬퍼 사용하여 컨버팅
        const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

        arr.push({
          basProductNm: item.prodNm, // 상품명
          basProductUrl: '/product/callplan?prod_id=' + item.prodId || '#', // 상품 URL (상품 URL이 없다면 #을 리턴)
          basFeeInfo: spec.basFeeInfo,  // 금액
          basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
          basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
          basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
          basNetworkList: basNetworkList, // 네트워크 타입
          basAdditionalObject: basAdditionalObject // 기본혜택/추가혜택에 대한 정보
        });

        return arr;
      }, []);
    }

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
     * 테마에 필요한 네트워크 명을 얻음
     * @param line 
     */
    private getThemeNetworkName( line ) {
      switch( line.deviceCode ) {
          case DEVICE_CODES.F:
          case DEVICE_CODES.P:
            return DEVICE_CODE_NAME.F; // 5G 또는 PPS 라면 파라미터명을 '5G'으로 보냄

          case DEVICE_CODES.L:
          case DEVICE_CODES.W:
            return DEVICE_CODE_NAME.L; // LTE 또는 2G 또는 3G라면 파라미터명을 'LTE'으로 보냄
          
          case DEVICE_CODES.E:
            return DEVICE_CODE_NAME.E; // Tablet 또는 2ndDevice라면 파라미터명을 '2ndDevice'으로 보냄
          
          default:   
            return DEVICE_CODE_NAME.F; // 값이 없다면 '5G'으로 보냄
      }
    }

    /**
     * Object 객체 체크
     * @param object 
     */
    private isObjectEmpty(object): Boolean {
      return Object.keys(object).length === 0 && object.constructor === Object;
    }

    /**
     * 이용/혜택 금액 파싱
     * @param benefitPrice 이용/혜택 금액
     */
    private convProductBenefitInfo(benefitPrice): any {
      const isNaNbenefitPrice = isNaN(Number(benefitPrice)) || FormatHelper.isEmpty(benefitPrice) ; // 상품 가격

      return {
        isNaN: isNaNbenefitPrice,
        price: isNaNbenefitPrice ? '' : FormatHelper.addComma(benefitPrice)
      };
    }

    /**
     * 내 요금제와 비교 버튼을 출력할것인지 체크
     * 
     * SB 내 요금제와 비교 버튼 노출 프로세스 참고
     * 
     * @param svcInfo 
     */
    private isCompareButton(line: any, svcInfo: any): Observable<any> {
      // 로그인이 안되어있다면? 
      if ( !svcInfo ) { 
        return Observable.of(false);
      }

       // 무선회선이 아니라면?
      if (SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) === -1 ) { 
        return Observable.of(false);
      }

      // 현재 회선이 LTE또는 5G가 아니라면?
      if ( line.deviceCode !== DEVICE_CODES.L && line.deviceCode !== DEVICE_CODES.F ) {
        return Observable.of(false);
      }
      
      return Observable.combineLatest(
        this.getExistsMyProductPLM() // 나의 상품에 해당되는 PLM 정보를 얻음
        , this.getExistsMyProductRedis(svcInfo) // 나의 상품에 해당되는 혜택 정보를 얻음
      ).map(([isExistsPLMData, isExistsRedisData]) => {

        // 문자 사용량에 대한 데이터가 없고 전화 데이터가 없고 데이터 대한 데이터가 없는지에 대해 체크한 값
        if ( isExistsPLMData || isExistsRedisData ) { 
          return true;
        }

        return false;
      })
    }

    /**
     * 나의 요금제의 PLM 정보가 있는지 체크 (BFF)
     */
    private getExistsMyProductPLM(): Observable<any>{
      return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const data = resp.result.feePlanProd;

          const basFeeTxt = this.convertUndefined(FormatHelper.getValidVars(data.basFeeTxt));
          const basDataGbTxt = this.convertUndefined(FormatHelper.getValidVars(data.basDataGbTxt));
          const basDataMbTxt = this.convertUndefined(FormatHelper.getValidVars(data.basDataMbTxt));
          const basOfrVcallTmsTxt = this.convertUndefined(FormatHelper.getValidVars(data.basOfrVcallTmsTxt));
          const basOfrCharCntTxt = this.convertUndefined(FormatHelper.getValidVars(data.basOfrVcallTmsTxt));

          // 문자 사용량에 대한 데이터가 없고 전화 데이터가 없고 데이터 대한 데이터가 없는지? ( 문자 사용량이 상세참조이고 데이터가 상세참조이고 전화 데이터가 상세참조이고 데이터가 상세 참조라면? )
          if ( !basFeeTxt && !basDataGbTxt && !basDataMbTxt && !basOfrVcallTmsTxt && !basOfrCharCntTxt ) {  
            return false;
          }

          return true;
        }
      });
    }

    /**
     * 나의 요금제의 어드민 등록 혜택이 있는지 체크 (Redis)
     * @param svcInfo 
     */
    private getExistsMyProductRedis(svcInfo: any): Observable<any>{
      const prodId = svcInfo.prodId; // 나의 회선에 해당되는 상품 코드

      return this.redisService.getData(REDIS_KEY.BENF_PROD_INFO + prodId).map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( resp.result.benfProdInfo && resp.result.benfProdInfo.length > 0 ) {
            return true;
          }
        } 
        return false;
      });
    }


    /**
     * 조건문에 데이터 중에 상세참조에 해당되는 데이터도 체크해야함. 
     * bff에서 가지고 온 텍스트 값이 '상세참조' 이라면 '상세참조'를 undefined 으로 변경한다.
     * @param txt 
     */
    private convertUndefined(txt) {
      if ( !txt ) {
        return undefined;
      }

      const deep = txt.replace(' ', ''); // '상세 참조' 와 같이 띄어쓰기가 있으면 띄어쓰기를 없애버린다.
      if ( deep === '상세참조' ) {
        return undefined;
      }
      return txt;
    }

    /**
     * Admin 에서 등록한 이미지에 대한 CDN 정보
     * @param 
     */
    private getCDN() {
      const env = String(process.env.NODE_ENV);
      if ( env === 'prd' ) { // 운영
        return 'https://cdnm.tworld.co.kr';
      } else if ( env === 'stg' ) { // 스테이징
        return 'https://cdnm-stg.tworld.co.kr';
      } else if ( env === 'dev') { // dev
        return 'https://cdnm-dev.tworld.co.kr';
      } else { // local
        return 'https://cdnm-dev.tworld.co.kr';
        // return 'http://172.23.69.117:3001'; // TODO: 임시
        // return 'http://localhost:3001';
      }
    }

}