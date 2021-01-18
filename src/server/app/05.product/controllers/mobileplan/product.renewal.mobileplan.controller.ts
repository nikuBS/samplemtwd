
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
  SVC_CDGROUP, SVC_ATTR_E
} from '../../../../types/bff.type';
import {
  DATA_UNIT, MYT_FEEPLAN_BENEFIT, FEE_PLAN_TIP_TXT, CURRENCY_UNIT
} from '../../../../types/string.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';
import CommonHelper from '../../../../utils/common.helper';

/**
 * @class
 * @desc 
 */

 // 손실보전 부가서비스 정보
const ADDITIONS_LIST = [
  {
    'additionNm' : 'FLO 앤 데이터', // 부가 서비스 명
    'additionIconImg' : '/img/product/v2/ico-add-flo.svg', // 부가 서비스 아이콘
    'additionNoticeMsg' : '', // notice 메시지
    'additionJoined': true, // 가입하기 버튼 노출(true) 또는 확인하기 버튼 노출 (false)
    'targetPayments': [ 'NA00006404' ,'NA00006539' ,'NA00006538' ,'NA00006797' ,'NA00006157' ], // 타겟이 되는 요금제 코드 리스트
    'targetAdditions': [ 'NA00006520' ] // 타겟이 되는 상품 리스트
  },
  {
    'additionNm' : 'FLO 앤 데이터 플러스',
    'additionIconImg' : '/img/product/v2/ico-add-flo.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405' ],
    'targetAdditions': [ 'NA00006599' ]
  },
  {
    'additionNm' : 'wavve 앤 데이터',
    'additionIconImg' : '/img/product/v2/ico-add-wavve.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006404' ,'NA00006539' ,'NA00006538' ,'NA00006797' ,'NA00006157' ],
    'targetAdditions': [ 'NA00006577' ]
  },
  {
    'additionNm' : 'wavve 앤 데이터 플러스',
    'additionIconImg' : '/img/product/v2/ico-add-wavve.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405' ],
    'targetAdditions': [ 'NA00006584' ]
  },

  {
    'additionNm' : 'T가족모아데이터',
    'additionIconImg' : '/img/product/v2/ico-add-vip.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006539', 'NA00006538', 'NA00006797', 'NA00006157', 'NA00005958', 'NA00005959', 'NA00007004', 'NA00007005' ],
    'targetAdditions': [ 'NA00006031' ]
  },
  {
    'additionNm' : '5G 스마트워치TAB할인(모)',
    'additionIconImg' : '/img/product/v2/ico-add-watch.svg',
    'additionNoticeMsg' : '',
    'targetPayments': [ 'NA00006405', 'NA00006404', 'NA00006403' ],
    'targetAdditions': [ 'NA00006484' ]
  },
]

export default class RenewProduct extends TwViewController {
    constructor() {
      super();
    }

    render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
      Observable.combineLatest(
        this.getMyPayment(svcInfo) // 사용중인 요금제 조회
        , this.getMyAdditions(svcInfo) // 사용중인 부가서비스 조회
      ).subscribe(([
        payment // 사용중인 요금제 데이터 결과 값
        , additions // 사용중인 부가서비스 결과 값
      ]) => {

        console.log('===>>', additions);
        const isWireless = svcInfo ? !(SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0) : false; // 무선 회선인지 체크
        const data = {
          payment
          , additions
          , isWireless
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
        return Observable.of([]);
      }

      if ( SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) >= 0 ) { // 지금 나의 회선이 유선 회선일 경우 요금제를 표현하지 않음.
        return Observable.of([]);
      }

      return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return this.convertWirelessPlan(resp.result);
        }
        
        return null;
      });
    }

    /**
     * 사용중인 부가 서비스를 조회
     * 
     * @param svcInfo 
     */
    private getMyAdditions ( svcInfo: any): Observable<any> { 
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
          const resultFilter = additionsFilter.filter(target => {
            return resp.result.addProdList.filter(joined => {
              return target.targetAdditions.indexOf(joined.prodId) === -1 ? true : false;
            });
          });

          return resultFilter;
        }
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
     * Admin 에서 등록한 이미지에 대한 CDN 정보
     * @param 
     */
    private getAdminCDN() {
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