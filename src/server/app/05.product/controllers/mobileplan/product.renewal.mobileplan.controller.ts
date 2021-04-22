
/**
 * @file 리스트 < 요금제 < 상품 (고도화)
 * @author Kinam Kim (P161322)
 * @since 2020.12.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { SVC_CDGROUP } from '../../../../types/bff.type';
import {
  DATA_UNIT, MYT_FEEPLAN_BENEFIT
} from '../../../../types/string.type';

import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';
import { flatMap } from 'rxjs/operators';
import CommonCertResult from '../../../00.common/controllers/cert/common.cert.result.controller';

// section sort 정보가 없을 때 기본값을 아래로 세팅하기 위해 (기본값: 테마배너, 테마리스트 순)
const DEFAULT_SORT_SECTION = 'THEME_LIST,THEME_BANNER';

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

enum SUB_DEVICE_CODES {
  'F01123' = 'W', // 2G (2G는 3G를 표현)
  'F01122' = 'W', // 3G
  'F01121' = 'L', // LTE
  'F01713' = 'F', // 5G
  'F01124' = 'E', // 태블릿/ETC (Custom)
  'F01125' = 'P', // PPS (Custom)
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

// 필터 폰트 코드
enum FILTER_FONT_STYLE_CODES {
  'F01122' = 'prod-band', // 3G (3G는 Band 임)
  'F01121' = 'prod-lte', // LTE
  'F01713' = 'prod-5g', // 5G
  'F01124' = 'prod-2nd', // 2ndDevice 
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

const LOSS_CMPS_PRODUCT_ID = 
[
  'NA00006405', // 5GX플래티넘
  'NA00006999', // D플래티넘(5GX플래티넘+다이렉트플랜)
  'NA00006539', // T플랜 맥스
  'NA00007004', // D맥스(T플랜 맥스+다이렉트플랜)
  'NA00006404', // 5GX프라임
  'NA00006538', // T플랜 스페셜
  'NA00007005', // D스페셜(T플랜 스페셜+다이렉트플랜)
  'NA00007001', // D프라임(5GX프라임+다이렉트플랜)
  'NA00006797', // T플랜 시니어 스페셜
  'NA00005134', // band 데이터 퍼펙트S
  'NA00007165', // 5G 언택트 61
  'NA00005959', // Data 인피니티
  'NA00005958', // 패밀리
  'NA00004777', // T 시그니처 Master(구)
  'NA00004776', // T 시그니처 Classic(구)
  'NA00006403', // 5GX스탠다드
  'NA00007002', // D스탠다드(5GX스탠다드+다이렉트플랜)
  'NA00007301', // 5GX레귤러플러스 
  'NA00006157', // 0플랜 라지
  'NA00006401'  // 0플랜 슈퍼 히어로
];

const LOSS_CMPS_PRODUCT_ID_EXCEPTIONAL = 
[
  'NA00006157', // 0플랜 라지
  'NA00006401', // 0플랜 슈퍼 히어로
  'NA00006403'  // 5GX스탠다드 -> 2021-04-19 추가
];

let lossCmpsInfo = new Map<String, Object>();

export default class RenewProduct extends TwViewController {
    constructor() {
      super();
    }

    render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
      
        Observable.combineLatest(this.getLine(svcInfo)).subscribe((line) => {
          line = line[0];

          Observable.combineLatest(
            this.getMyPayment(svcInfo) // 사용중인 요금제 조회
            , this.getPiAgree(svcInfo) // 개인정보 동의 조회
            , this.getSortSection(line) // 섹션 순서 데이터를 조회
            , this.getThemeListData(svcInfo, line) // 리스트 형 테마 데이터를 조회
            , this.getMyAge(svcInfo) // 나의 나이를 리턴받음
            , this.isCompareButton(line, svcInfo) // 비교하기 버튼 출력 여부
            , this.getLossCmpsResult(svcInfo)  // 손실보전 항목 노출 여부
          ).subscribe(([
            payment // 사용중인 요금제 데이터 결과 값
            , piAgree // 개인정보 동의 여부
            , sortSection // 섹션 순서 데이터 결과 값
            , themeListData // 테마 리스트 데이터 조회
            , myAge // 내 회선에 대한 나의 만 나이
            , isCompareButton // 비교하기 버튼 출력 여부
            , lossCmpsResult // 손실보전 항목 노출 여부
          ]) => {
            //console.log('### =====================================================================');
            //console.log('### lossCmpsResult : ' + JSON.stringify(lossCmpsResult));

            let lossCmpsList : any;
            if(lossCmpsResult == API_CODE.CODE_00 || lossCmpsResult === '0'){
              lossCmpsList = this.getMultiAdditionCheck(svcInfo, lossCmpsInfo);
            }else{
              lossCmpsList = null;
            }

            //console.log('### lossCmpsList : ' + JSON.stringify(lossCmpsList));
            //console.log('### lossCmpsList : render');
            //console.log('### =====================================================================');

            const isWireless = svcInfo ? !(SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) : false; // 무선 회선인지 체크
            const data = {
              line, payment, piAgree, isWireless, sortSection, themeListData, myAge, isCompareButton, cdn: this.getCDN()
              , lossCmpsList
            }

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
    private getPiAgree ( svcInfo: any ): Observable<any> {
      if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 현재 사용중인 요금제를 표현할 필요가 없음.
        return Observable.of(null);
      }

      if ( SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0 ) { // 지금 나의 회선이 유선 회선일 경우 요금제를 표현하지 않음.
        return Observable.of(null);
      }

      return this.apiService.request(API_CMD.BFF_03_0014, {}, {}, [svcInfo.svcMgmtNum] ).map((resp) => {
        //console.log('API_CMD.BFF_03_0014::: ', resp);
        
        if (resp.code === API_CODE.CODE_00) {
          return resp.result;
        }
        return null;
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
     * 
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
      if (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) { // 회선이 유선이라면 5G로 리턴함 ( 유선회선에서 0220 API 호출 시 에러발생함 )
        return Observable.of(DEVICE_CODES.F);
      }

      return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {

          try {
            // 2021. 03. 16 BFF_05_0220의 BFF 중 prodFltId의 필드값으로 사용해달라는 요청이 있었음.
            if ( resp.result.prodFltId ) {
              if ( Object.keys(SUB_DEVICE_CODES).indexOf( resp.result.prodFltId ) > -1 ) {
                return SUB_DEVICE_CODES[resp.result.prodFltId];
              }
            }

            // 단말기 방식 코드 검사 ( 2021. 03. 16. BE 단말기 코드 검사 방식 변경요청으로 prodFltId의의 로직으로 변경 )
            // if ( Object.keys(DEVICE_CODES).indexOf( resp.result.eqpMthdCd ) > -1 ) {
            //   return DEVICE_CODES[resp.result.eqpMthdCd];
            // }

            // 중 분류 코드가 휴대폰이 아닌경우는 모두 '2nd Device' 장비
            if ( resp.result.beqpMclEqpClSysCd !== '0101000' ) {
              return DEVICE_CODES.E;
            }

            return DEVICE_CODES.W; // 코드에 해당되는 데이터가 없으면 W로 세팅
          } catch (e) {
            return DEVICE_CODES.W; // 코드에 해당되는 데이터가 없으면 W로 세팅
          }
        }
        
        return DEVICE_CODES.W; // CODE 값이 00이 아니라면 W로 세팅
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

      const isProductShow = this.convertUndefined(data.feePlanProd.basDataGbTxt) // 상세참조에 노출여부
        || this.convertUndefined(data.feePlanProd.basDataMbTxt) 
        || this.convertUndefined(data.feePlanProd.basOfrVcallTmsTxt)
        || this.convertUndefined(data.feePlanProd.basOfrVcallTmsTxt);

      return {
        product: FormatHelper.isEmpty(data.feePlanProd) ? null : {
          isProductShow: isProductShow, // 데이터, 음성, 문자 데이터 중 하나라도 존재하면 데이터, 음성, 문자를 출력한다
          basProductNm: data.feePlanProd.prodNm, // 상품명
          basFeeInfo: spec.basFeeInfo,  // 금액
          basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
          basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
          basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자

          feePlanProd: data.feePlanProd // 상품정보
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
     * 네트워크 타입을 리턴
     * @param prodFltList 
     */
    private convertBasNetworkType(prodFltList): any {
      if ( !prodFltList ) {
        return '';
      }

      const type = prodFltList.find(item => {
        return Object.keys(FILTER_FONT_STYLE_CODES).indexOf(item.prodFltId) > -1 ? item : '';
      });

      if ( type && type.prodFltId ) {
        return FILTER_FONT_STYLE_CODES[type.prodFltId];
      }

      return '';
    }

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
     * 선택 약정 반영 월 정액 금액을 파싱
     * @param benfProdList 
     */
    private convertAgreementAmount(basAgreementAmount) {
      const isbasAgreementAmount = isNaN(Number(basAgreementAmount));

      return {
        isNaN: isbasAgreementAmount,
        value: isbasAgreementAmount ? basAgreementAmount : FormatHelper.addComma(basAgreementAmount)
      };
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
        const basAgreementAmountCtt = FormatHelper.getValidVars(item.selAgrmtAplyMfixAmt); // 선택 약정 금액 반영 월 정액 금액

        const basDataGbTxt = FormatHelper.getValidVars(item.basOfrGbDataQtyCtt); // 데이터 제공량 (GB)
        const basDataMbTxt = FormatHelper.getValidVars(item.basOfrMbDataQtyCtt); // 데이터 제공량 (MB)
        const basDataTxt = this.convertBasDataTxt(basDataGbTxt, basDataMbTxt); // GB, MB 컨버터
        
        const basNetworkType = this.convertBasNetworkType(item.prodFltList) || ''; // 회선의 네트워크 타입 ( 데이터타입에 폰트 컬러를 설정하는 스타일 지정 )
        const basNetworkList = this.convertBasNetwork(item.prodFltList) || []; // 네트워크값을 파싱 ( LTE/5G의 아이콘 스타일 및 텍스트를 지정)
        const basAdditionalObject = this.convertAdditionalList(item.benfProdList) || []; // 부가 서비스 정보를 파싱

        const basAgreementAmount = this.convertAgreementAmount(basAgreementAmountCtt); // 선택 약정 금액 반영 월 정액 금액 계산

        // 상품 스펙 공통 헬퍼 사용하여 컨버팅
        const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

        arr.push({
          basProductNm: item.prodNm, // 상품명
          basProdId: item.prodId, // 상품 코드
          basProductUrl: '/product/callplan?prod_id=' + item.prodId || '#', // 상품 URL (상품 URL이 없다면 #을 리턴)
          basFeeInfo: spec.basFeeInfo,  // 금액
          basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
          basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
          basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
          basAgreementAmount: basAgreementAmount, // 선택 약정 금액 반영 월 정액
          basNetworkType: basNetworkType, // 네트워크 타입
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
      // 2021. 03. 10 [기획] 일반 법인 이동전화, SKT 법인 이동전화, SWG기준 실사용자 등록된 법인 이동전화에 대한 조건을 빼달라고함
      return (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) || (['O'].indexOf(svcInfo.svcGr) >= 0); 
      // return (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) || (['R', 'D', 'E', 'O'].indexOf(svcInfo.svcGr) >= 0);
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

          if ( !data ) {
            return false;
          }

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
      * 손실보전 조회
      * @param svcInfo 
      */
    private getLossCmpsResult(svcInfo: any){
      // 미로그인, 간편로그인일 경우 손실보전 조회 안함
      if( !svcInfo || svcInfo.loginType != 'T'){ 
        //console.log('### : 대상아님');
        //console.log('### : ' + JSON.stringify(svcInfo));
        return Observable.of(null);
      }else{
        // 1. 사용자의 상품이 손실보전 체크 대상인지 체크
        return Observable.of(this.checkProductId(svcInfo))
          .pipe(flatMap(p1 => {
            //console.log('### pipe1 start');
            //console.log('### pipe1 : ' + p1);
            //console.log('### pipe1 end');
            return Observable.of(p1);
         }))
          // 2. 손실보전 Redis 조회
          .pipe(flatMap(p2 => {
            //console.log('### pipe2 start : ' + p2);

            if(p2 === undefined){
              //console.log('### pipe2 end : 대상 요금제 아님');
              return Observable.of(null);
            }else{
              lossCmpsInfo.set("productId", p2);

              return this.redisService.getData(REDIS_KEY.LOSS_CMPS_INFO + p2).map((resp) => {
                //console.log('### pipe2 redis resp : ' + JSON.stringify(resp));
                
                if(resp.code === API_CODE.CODE_00) {
                  let redisProductList = resp.result.lossCmpsInfo;
                
                  for(let i = 0 ; i < redisProductList.length; i++){
                    //console.log('### pipe2 redis[' + i + '] : ' + redisProductList[i].lossCmpsNm);
                  }

                  lossCmpsInfo.set("redisProductList", redisProductList);
                  //console.log('### pipe2 end : success');
                }else{
                  //console.log('### pipe2 end : fail');
                }

                return resp.code;
              });
            }
          }))
          // 3.무선 부가서비스 사용 여부 조회
          .pipe(flatMap(p3 => {
            //console.log('### pipe3 start : ' + p3);

            if(p3 === API_CODE.CODE_00  || p3 === '0'){
              let tempScrbList = new Set();
              let tempUnScrbList = new Set();
              let tempBffList = new Set();
              let redisProductList : any = lossCmpsInfo.get("redisProductList");

              for(let i = 0 ; i < redisProductList.length; i++){
                if(redisProductList[i].scrbChkObjInfo){
                  let temp = (redisProductList[i].scrbChkObjInfo).split('~');
                  temp.forEach(value => { tempScrbList.add(value); });
                }

                if(redisProductList[i].unscrbChkObjInfo){
                  let temp = (redisProductList[i].unscrbChkObjInfo).split('~');
                  temp.forEach(value => { tempUnScrbList.add(value); });
                }

                if(redisProductList[i].lossCmpsBffId){
                  let temp = (redisProductList[i].lossCmpsBffId).split('~');
                  temp.forEach(value => { tempBffList.add(value); });
                }
              }
             
              // 임시 변수의 내용을 배열로 반환
              let checkScrbList = Array.from(tempScrbList);
              let checkUnScrbList = Array.from(tempUnScrbList);
              let lossCmpsBffId = Array.from(tempBffList);

              lossCmpsInfo.set("scrbChkObjInfo", checkScrbList);
              lossCmpsInfo.set("unscrbChkObjInfo", checkUnScrbList);
              lossCmpsInfo.set("lossCmpsBffId", lossCmpsBffId); 

              // 3-2. 무선 부가서비스 사용 여부 다중 조회
              // 무선 부가서비스 사용 여부 조회할 상품 아이디 조합
              let searchProductId = checkScrbList.join('~');
              //console.log('### pipe3 scrbChkObjInfo : ' + checkScrbList);
              //console.log('### pipe3 unscrbChkObjInfo : ' + checkUnScrbList);
              //console.log('### pipe3 lossCmpsBffId : ' + lossCmpsBffId);

              // 무선 부가서비스 사용 여부 조회(미성년자는 가입불가이므로 조회할 필요 없음)
              if(svcInfo.isAdult){
                if(!FormatHelper.isEmpty(checkScrbList) && !FormatHelper.isEmpty(checkUnScrbList)){
                  searchProductId += '~';
                }
                searchProductId += checkUnScrbList.join('~');
  
                //console.log('### pipe3 BFF_10_0183 searchProductId : ' + searchProductId);

                if(searchProductId){
                  return this.apiService.request(API_CMD.BFF_10_0183, {}, {}, [ searchProductId ]).map((resp) => {
                    //console.log('### pipe3 BFF_10_0183 : ' + JSON.stringify(resp));
                    this.logger.debug(JSON.stringify(resp));
    
                    if(resp.code === API_CODE.CODE_00) { 
                      //console.log('### pipe3 end : success');
                      lossCmpsInfo.set("multiAddition", resp.result);
                      return resp.code;
                    }else if (resp.code === 'ICAS4003') {
                      try{
                        let multiAddition = '';
                        multiAddition += '{';
                        for(let i = 0 ; i < searchProductId.split('~').length; i++){
                          multiAddition += '"' + searchProductId.split('~')[i] + '":' + '"N"';
                          if(i < searchProductId.split('~').length - 1){
                            multiAddition += ',';
                          }
                        }
                        multiAddition += '}';
                        lossCmpsInfo.set("multiAddition", JSON.parse(multiAddition));
                        //console.log('### pipe3 end : ICAS4003 => ' + JSON.parse(multiAddition));
    
                        return API_CODE.CODE_00;
                      }catch(e){
                        this.logger.error(e);
                        return Observable.of(null); 
                      }
                    }else{
                      //console.log('### pipe3 end : fail');
                      return Observable.of(null); 
                    }
                  });
                }else{
                  //console.log('### pipe3 end : success : searchProductId is empty');
                  return API_CODE.CODE_00;
                }
              }else{
                //console.log('### pipe3 end : success : is not adult');
                return API_CODE.CODE_00;
              }
            }else{
              //console.log('### pipe3 end : pipe2 receive fail');
              return Observable.of(null); 
            }
          }))
          // 4. T Mermbership 체크가 필요할 경우 체크
          .pipe(flatMap(p4 => {
            //console.log('### pipe4 start : ' + p4);
           
            // 현재는 lossCmpsBffId에 BFF_04_0001 한개만 오게 되어있음
            if(p4 === API_CODE.CODE_00 || p4 === '0'){
              let lossCmpsBffId = lossCmpsInfo.get("lossCmpsBffId");
              //console.log('### pipe4 lossCmpsBffId : ' + lossCmpsBffId);

              if(lossCmpsBffId == 'BFF_04_0001'){
                return this.apiService.request(API_CMD.BFF_04_0001, {}, {}, []).map((resp) => {
                  //console.log('### pipe4 BFF_04_0001 : ' + JSON.stringify(resp));

                  if(resp.code === API_CODE.CODE_00){ 
                    //console.log('### pipe4 end : T membership pass');
                    lossCmpsInfo.set("tmembership", "N");
                  }else{
                    //console.log('### pipe4 end : T membership add');
                    lossCmpsInfo.set("tmembership", "Y");
                  }

                  return p4;
                });
              }else{
                //console.log('### pipe4 end : T membership not');
                return API_CODE.CODE_00;
              }
            }else{
              //console.log('### pipe4 end : pipe3 receive fail');
              return Observable.of(null);
            }
          }))
          ;
       }
    }

    // 사용자의 요금제가 손실보전 체크 대상 요금제인지 체크
    private checkProductId(svcInfo : any){
      return LOSS_CMPS_PRODUCT_ID.find((n) => ( n === svcInfo.prodId) );
    }

    // 사용자의 요금제가 예외 처리가 필요한 요금제인지 체크
    private checkProductIdByExceptional(productId : String){
      return LOSS_CMPS_PRODUCT_ID_EXCEPTIONAL.find((n) => ( n === productId) );
    }

    // 사용자의 부가서비스 가입 여부 체크하여, 손실 보전 정보 생성
    private getMultiAdditionCheck(svcInfo : any, lossCmpsInfo : any){
      //console.log('### getMultiAdditionCheck');
      //console.log('### lossCmpsInfo.productId : ' + lossCmpsInfo.get("productId"));
      //console.log('### lossCmpsInfo.redisProductList : ' + JSON.stringify(lossCmpsInfo.get("redisProductList")));
      //console.log('### lossCmpsInfo.scrbChkObjInfo : ' + lossCmpsInfo.get("scrbChkObjInfo"));
      //console.log('### lossCmpsInfo.unscrbChkObjInfo : ' + lossCmpsInfo.get("unscrbChkObjInfo"));
      //console.log('### lossCmpsInfo.lossCmpsBffId : ' + lossCmpsInfo.get("lossCmpsBffId"));
      //console.log('### lossCmpsInfo.multiAddition : ' + JSON.stringify(lossCmpsInfo.get("multiAddition")));

      let productId = lossCmpsInfo.get("productId");
      let lossCmpsList : Array<any> = [];

      if(this.checkProductIdByExceptional(productId)){
        lossCmpsList = this.getMultiAdditionCheckByExceptional(svcInfo, productId, lossCmpsInfo);
      }else{
        lossCmpsList = this.getMultiAdditionCheckByDefault(svcInfo, lossCmpsInfo);
      }

      //console.log('### getMultiAdditionCheck lossCmpsList last : ' + JSON.stringify(lossCmpsList));
      //console.log('### getMultiAdditionCheck end ============================================');

      //expsSeq에 맞게 변경하여 리턴
      return lossCmpsList.sort(function(a, b){
        return a.expsSeq - b.expsSeq;
      });
    }

    private getMultiAdditionCheckByDefault(svcInfo : any, lossCmpsInfo : any){
      //console.log('### getMultiAdditionCheckByDefault');

      let lossCmpsList : Array<any> = [];
      let multiAddition = lossCmpsInfo.get("multiAddition");
      let redisProductList = lossCmpsInfo.get("redisProductList");

      // scrbChkObjInfo, unscrbChkObjInfo, lossCmpsBffId 확인 후 lossCmpsList push
      for(let i = 0 ; i < redisProductList.length; i++){
        let item = redisProductList[i];

        //console.log('### getMultiAdditionCheckByDefault redisProductList[' + i + '] start : ============================================');
        //console.log('### getMultiAdditionCheckByDefault lossCmpsNum : ' + item.lossCmpsNum);
        //console.log('### getMultiAdditionCheckByDefault lossCmpsNm : ' + item.lossCmpsNm);
        //console.log('### getMultiAdditionCheckByDefault scrbChkObjInfo : ' + item.scrbChkObjInfo);
        //console.log('### getMultiAdditionCheckByDefault unscrbChkObjInfo : ' + item.unscrbChkObjInfo);
        //console.log('### getMultiAdditionCheckByDefault lossCmpsBffId : ' + item.lossCmpsBffId);

        // 미성년자는 T Membership만 체크
        if(svcInfo.isAdult){
          // scrbChkObjInfo
          if(item.scrbChkObjInfo){
            let scrbChkObjList = item.scrbChkObjInfo.split('~');

            for(let j = 0 ; j < scrbChkObjList.length; j++){
              let scrbChkObjInfo = scrbChkObjList[j];
              //console.log('### getMultiAdditionCheckByDefault scrbChkObjInfo [' + j + '] : ' + scrbChkObjInfo + ' : ' + multiAddition[scrbChkObjInfo]);
            }
          }

          // unscrbChkObjInfo
          if(item.unscrbChkObjInfo){
            let check = '';
            let join = '';
            let unscrbChkObjList = item.unscrbChkObjInfo.split('~');

            for(let k = 0 ; k < unscrbChkObjList.length; k++){
              let unscrbChkObjInfo = unscrbChkObjList[k];
              check += 'N';
              join += multiAddition[unscrbChkObjInfo];
              //console.log('### getMultiAdditionCheckByDefault unscrbChkObjInfo [' + k + '] : ' + unscrbChkObjInfo + ' : ' + multiAddition[unscrbChkObjInfo]);
            }
            //console.log('### getMultiAdditionCheckByDefault join : check = ' + join + ' : ' + check);

            if(join === check && svcInfo.isAdult){
              //console.log('### getMultiAdditionCheckByDefault lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
              //console.log('### getMultiAdditionCheckByDefault lossCmpsList push item : ' + item);
              lossCmpsList.push(item);
            }
          }
        }

        // T Membership 체크
        if(item.lossCmpsBffId == 'BFF_04_0001'){
          if(lossCmpsInfo.get("tmembership") === "Y"){
            //console.log('### getMultiAdditionCheckByDefault lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
            //console.log('### getMultiAdditionCheckByDefault lossCmpsList push item : ' + item);
            lossCmpsList.push(item);
          }
        }
        //console.log('### getMultiAdditionCheckByDefault redisProductList[' + i + '] end : ============================================');
      }

      return lossCmpsList;
    }

    private getMultiAdditionCheckByExceptional(svcInfo : any, productId : String, lossCmpsInfo : any){
      //console.log('### getMultiAdditionCheckByExceptional exceptional');

      let lossCmpsList : Array<any> = [];
      let multiAddition = lossCmpsInfo.get("multiAddition");
      let redisProductList = lossCmpsInfo.get("redisProductList");

      if(productId === 'NA00006157' || productId === 'NA00006401'){
        //console.log('### getMultiAdditionCheckByExceptional : NA00006157 or NA00006401');

        // WAVVE_FLO_70% 체크 여부
        let option1 = false;
        // T Membership 체크 여부
        let option2 = false;

        // 미성년자는 T Membership만 체크하므로 if 안의 상품정보를 체크하지 않음
        if(svcInfo.isAdult){
          // NA00007298 or NA00006164 둘 중 한개는 반드시 가입되어 있음(둘다가입은 없음)
          //console.log('### getMultiAdditionCheckByExceptional NA00007298 : ' + multiAddition['NA00007298']);
          //console.log('### getMultiAdditionCheckByExceptional NA00006164 : ' + multiAddition['NA00006164']);

          if(multiAddition['NA00007298'] != 'N' && multiAddition['NA00007298'] != 'undefined'){
            //console.log('### getMultiAdditionCheckByExceptional : Flo, Wavve Check');
            option1 = true;
          }else if(multiAddition['NA00006164'] != 'N' && multiAddition['NA00006164'] != 'undefined'){
            //console.log('### getMultiAdditionCheckByExceptional : T Membership Check');
            option2 = true;
          }else{
            //console.log('### getMultiAdditionCheckByExceptional : Not Check');
          }
        }else{
          option1 = false;
          option2 = true;
        }

        // scrbChkObjInfo, unscrbChkObjInfo, lossCmpsBffId 확인 후 lossCmpsList push
        for(let i = 0 ; i < redisProductList.length; i++){
          let item = redisProductList[i];
           
          //console.log('### getMultiAdditionCheckByExceptional redisProductList[' + i + '] start : ============================================');
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsNum : ' + item.lossCmpsNum);
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsNm : ' + item.lossCmpsNm);
          //console.log('### getMultiAdditionCheckByExceptional scrbChkObjInfo : ' + item.scrbChkObjInfo);
          //console.log('### getMultiAdditionCheckByExceptional unscrbChkObjInfo : ' + item.unscrbChkObjInfo);
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsBffId : ' + item.lossCmpsBffId);

          // 미성년자는 T Membership만 체크
          if(svcInfo.isAdult){
            // unscrbChkObjInfo
            if(item.unscrbChkObjInfo && option1){
              let check = '';
              let join = '';
              let unscrbChkObjList = item.unscrbChkObjInfo.split('~');

              for(let k = 0 ; k < unscrbChkObjList.length; k++){
                let unscrbChkObjInfo = unscrbChkObjList[k];
                check += 'N';
                join += multiAddition[unscrbChkObjInfo];
                //console.log('### getMultiAdditionCheckByExceptional unscrbChkObjInfo [' + k + '] : ' + unscrbChkObjInfo + ' : ' + multiAddition[unscrbChkObjInfo]);
              }
              //console.log('### getMultiAdditionCheckByExceptional join : check = ' + join + ' : ' + check);

              if(join === check){
                //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
                //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push item : ' + item);
                lossCmpsList.push(item);
              }
            }
          }

          // T Membership 체크
          if(item.lossCmpsBffId == 'BFF_04_0001' && option2){
            //console.log('### getMultiAdditionCheckByExceptional lossCmpsInfo.get("tmembership") : ' + lossCmpsInfo.get("tmembership"));
            if(lossCmpsInfo.get("tmembership") === "Y"){
              //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
              //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push item : ' + item);
              lossCmpsList.push(item);
            }
          }
          //console.log('### getMultiAdditionCheckByExceptional redisProductList[' + i + '] end : ============================================');
        }
      }else if(productId === 'NA00006403'){
        //console.log('### getMultiAdditionCheckByExceptional : NA00006403');

        // scrbChkObjInfo 확인 후 lossCmpsList push
        let tMemberShipOnly = false;
        for(let i = 0 ; i < redisProductList.length; i++){
          let item = redisProductList[i];
          if(item.scrbChkObjInfo === 'NA00006598'){
            tMemberShipOnly = true;
          }
        }

        //console.log('### getMultiAdditionCheckByExceptional tMemberShipOnly : ' + tMemberShipOnly);

        for(let j = 0 ; j < redisProductList.length; j++){
          let item = redisProductList[j];

          //console.log('### getMultiAdditionCheckByExceptional redisProductList[' + j + '] start : ============================================');
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsNum : ' + item.lossCmpsNum);
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsNm : ' + item.lossCmpsNm);
          //console.log('### getMultiAdditionCheckByExceptional scrbChkObjInfo : ' + item.scrbChkObjInfo);
          //console.log('### getMultiAdditionCheckByExceptional unscrbChkObjInfo : ' + item.unscrbChkObjInfo);
          //console.log('### getMultiAdditionCheckByExceptional lossCmpsBffId : ' + item.lossCmpsBffId);

          if(tMemberShipOnly){
            if(item.scrbChkObjInfo == 'NA00006598'){
              // T Membership 체크
              if(item.lossCmpsBffId == 'BFF_04_0001'){
                //console.log('### getMultiAdditionCheckByExceptional lossCmpsInfo.get("tmembership") : ' + lossCmpsInfo.get("tmembership"));
                if(lossCmpsInfo.get("tmembership") === "Y"){
                  //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
                  //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push item : ' + item);
                  lossCmpsList.push(item);
                }
              }
            }
          }else{
            if(item.scrbChkObjInfo == 'NA00006598'){
              //console.log('### getMultiAdditionCheckByExceptional tmembership : pass');
            }else{
              let check = '';
              let join = '';
              let unscrbChkObjList = item.unscrbChkObjInfo.split('~');

              for(let k = 0 ; k < unscrbChkObjList.length; k++){
                let unscrbChkObjInfo = unscrbChkObjList[k];
                check += 'N';
                join += multiAddition[unscrbChkObjInfo];
                //console.log('### getMultiAdditionCheckByExceptional unscrbChkObjInfo [' + k + '] : ' + unscrbChkObjInfo + ' : ' + multiAddition[unscrbChkObjInfo]);
              }

              if(join === check){
                //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push : ' + item.lossCmpsNum + '.' + item.lossCmpsNm);
                //console.log('### getMultiAdditionCheckByExceptional lossCmpsList push item : ' + item);
                lossCmpsList.push(item);
              }
              //console.log('### getMultiAdditionCheckByExceptional join : check = ' + join + ' : ' + check);
            }
          }
          //console.log('### getMultiAdditionCheckByExceptional redisProductList[' + j + '] end : ============================================');
        }
      }else{
        //console.log('### getMultiAdditionCheckByExceptional : else');
      }

      return lossCmpsList;
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
      } else { // 기타
        return 'https://cdnm-stg.tworld.co.kr';
      }
    }

}