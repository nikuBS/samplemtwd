
/**
 * @file 리스트 < 요금제 < 전체 리스트
 * @author 
 * @since 2020.12.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { PRODUCT_CODE, _5GX_PROD_ID } from '../../../../types/bff.type';

// 단말기 분류 체계 코드
enum DEVICE_MINOR_CODES {
  '0102001' = 'E', // Voice or Data 가능한 tablet (태블릿/ETC 범주)
  '0202001' = 'E', // Voice 불가능한 Tablet (태블릿/ETC 범주)
  '0102000' = 'E', // 회선형 Device (태블릿/ETC 범주)

  '0102002' = 'E', // Smart Watch (회선형 스마트 워치류)
  '0102003' = 'E', // Kids폰 (회선형 스마트 워치류(주니어 seg. 상품)_쿠키즈 요금제 가입 가능 단말)
  '0102005' = 'E', // Modem (WiFi AP 기능 없으나, 물리적 연결을 통해 통신 연결해주는 Device)
  '0102006' = 'E', // 기타 장치 (위치 측위기반 Device)
  '0102009' = 'E', // 기타
  '0102010' = 'E', // Router (포켓파이 Roter류)
}

/**
 * @class
 * @desc 
 */
export default class RenewProductPlans extends TwViewController {
  constructor() {
      super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const params: any = {
      idxCtgCd: PRODUCT_CODE.MOBILE_PLAN,
      opClCd : '01'
    };

    const series = { //상단 요금제 분류 선택시 하이라이트를 주기 위해
      fiveGx :  '',
      lte : '',
      threeG : '',
      secondDevice : '',
      prepay : '',
      theme : '',
      noSeries : false,
      seriesClass : '',
    };
    const filterList = {
      filterList : ''
    };

    if(req.query.filters) {
      const seriesCode: string = this._getSeries(req.query.filters);
    
      switch(seriesCode) { // 상단 탭 하이라이트 적용
        case 'F01713':
          series.fiveGx = ' class=on';
          series.seriesClass = 'prod-5g';
          break;
        case 'F01121':
          series.lte = ' class=on';
          series.seriesClass = 'prod-lte';
          break;
        case 'F01122':
          series.threeG = ' class=on';
          series.seriesClass = 'prod-band';
          break;
        case 'F01124':
          series.secondDevice = ' class=on';
          series.seriesClass = 'prod-2nd';
          break;
        case 'F01125':
          series.prepay = ' class=on';
          series.seriesClass = 'prod-2nd';
          break;
        default:
          series.noSeries = true;
          break;
      }
        filterList.filterList = this._getFilterList(req.query.filters);
        if(filterList.filterList === '') {
          params.idxCtgCd = seriesCode;
        }
    } else {
      series.noSeries = true;
    }

    if ((req.query.theme || filterList.filterList === '') && !req.query.code) {
      if(req.query.theme) {
        params.idxCtgCd = 'F01180';
      }
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getSeriesPlans(params)
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans
        ]) => {
          if(req.query.theme) {
          series.theme = ' class=on';
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.theme.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          } else if (series.fiveGx == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.5g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          } else if(series.lte == ' class=on' || series.threeG == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.lte3g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          } else if(series.secondDevice == ' class=on'){
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.2ndDevice.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          } else if(series.prepay == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.prepay.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          } else {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.listall.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans });
          }
        });   
    } else if (series.noSeries === true && !req.query.code) {
      params.searchFltIds =  req.query.filters;
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getInitPlans(params)
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans
        ]) => {
          const mobileList = [{name: '5G', code: 'F01713',exist: 'N',url:'/product/renewal/mobileplan/list?filters=F01713', seriesClass: 'prod-5g'}, // 요금제 더보기용 url 입력 / 색상을 위한 클래스 추가
            {name: 'LTE', code: 'F01121',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01121', seriesClass: 'prod-lte'},
            {name: '3G', code: 'F01122',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01122', seriesClass: 'prod-band'},
            {name: '태블릿/2nd Device', code: 'F01124',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01124', seriesClass: 'prod-2nd'},
            {name: '선불', code: 'F01125',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01125', seriesClass: 'prod-2nd'}];
          
          for( let k in mobileList ) {
            for( let i in plans.products) {
                if(mobileList[k].code === plans.products[i].prodFltId){
                  mobileList[k].exist = 'Y';
              }
            }
          }
  
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterall.html', { svcInfo, params, pageInfo, series, filterList, plans, mobileList, networkInfoFilter } );
        });

    } else {
      if(req.query.code) {
        params.searchFltIds = req.query.filters + ',' + req.query.code
      }
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getSeperatePlans(params)
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans
        ]) => {
        if (plans.code) {
          this.error.render(res, {
            code: plans.code,
            msg: plans.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
        
        if(plans.productCount === 0) { // 요금제 항목 없음
          res.render( 'mobileplan/renewal/list/product.renewal.mobileplan.list.nolist.html' , { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter } );
        } else if(series.noSeries == false) { // 탭 선택 후 필터 적용
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterlist.html', { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter } );
        } 
      });
    }
  } 

  private _getInitPlans(params) {
    return this.apiService.request(API_CMD.BFF_10_0205, params).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        products: resp.result.products.map(plan => {
          return {
            ...plan,
            basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeAmt),
            basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrDataQtyCtt) ?
              this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
                null :
                ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
                ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrDataQtyCtt, DATA_UNIT.GB),
            basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
              null :
              ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
            tabCode: this._getTabCodeInit(plan),
            prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
            compareYN: this._getCompareYN(this._getTabCodeInit(plan),plan.basFeeAmt,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
            //m24agrmtFeeAmt: this._getM24agrmtFeeAmt(plan.basFeeAmt,plan.m24agrmtDcAmt)
          };
        })
      };
    });
  }

  private _getSeperatePlans(params) {
    return this.apiService.request(API_CMD.BFF_10_0031, params).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        products: resp.result.products.map(plan => {
          return {
            ...plan,
            basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeAmt),
            basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrDataQtyCtt) ?
              this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
                null :
                ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
                ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrDataQtyCtt, DATA_UNIT.GB),
            basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
              null :
              ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
            tabCode: this._getTabCodeSeperate(plan),
            prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
            compareYN: this._getCompareYN(this._getTabCodeSeperate(plan),plan.basFeeAmt,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
          };
        })
      };
    });
  }

  private _isEmptyAmount(value: string) {
    return !value || value === '' || value === '-';
  }

  private _getSeries(searchFltIds): string { // 탭 정보 얻어옴
    const splitCheck: string[] = searchFltIds.split(',');
    if(splitCheck.length === 0) {
      return '';
    }
    let splitSeries = splitCheck.filter(split => (split === 'F01713' || split === 'F01121' || split === 'F01122' || split === 'F01124' || split === 'F01125'));
    if(splitSeries[0]){
      return splitSeries[0];
    }
    
    return '';
  }

  private _getFilterList(searchFltIds): string { // 필터 리스트 얻어옴
    let splitCheck = searchFltIds.split(',');
    let splitFilter = splitCheck.filter ( splits => !(splits === 'F01713' || splits === 'F01121' || splits === 'F01122' || splits === 'F01124' || splits === 'F01125'));
    let splitString : string = '';
    for(let i = 0; i < splitFilter.length; i++) {
      splitString += ',';
      splitString += splitFilter[i];
    }
    return splitString;
  }

  private getNetworkInfoFilter ( svcInfo: any ): Observable<any> {
    if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) { // 로그인이 되어있지 않거나 선택된 회선이 없다면 현재 사용중인 요금제를 표현할 필요가 없음.
      return Observable.of(['5G', 'LTE', '3G', '2nd', 'PPS']);
    }

    if ( svcInfo.svcGr === 'P' ) { // 선택한 회선이 선불폰(PPS) 라면 P
      return Observable.of(['PPS', '5G', 'LTE', '3G', '2nd']);
    }
    
    return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if ( Object.keys(DEVICE_MINOR_CODES).indexOf( resp.result.beqpSclEqpClSysCd ) > -1 ) {
          return this.matchSvcCode(DEVICE_MINOR_CODES[resp.result.beqpSclEqpClSysCd]);
        }
        return this.matchSvcCode(resp.result.eqpMthdCd);
      }
      return ['5G', 'LTE', '3G', '2nd', 'PPS'];
    });
  }

  private matchSvcCode (code) { // 전체요금제 최초 랜딩 시 요금제 시리즈 래더링 순서
    
    switch(code) {
      case 'A' : //2G (3G로 표현)
        return ['3G', '5G', 'LTE', '2nd', 'PPS'];
      case 'D' : //2G (3G로 표현)
        return ['3G', '5G', 'LTE', '2nd', 'PPS'];
      case 'W' : //3G
        return ['3G', '5G', 'LTE', '2nd', 'PPS'];
      case 'L' : //LTE
        return ['LTE', '5G', '3G', '2nd', 'PPS'];
      case 'F' : //5G
        return ['5G', 'LTE', '3G', '2nd', 'PPS'];
      case 'E' : //2nd Device
        return ['2nd', '5G', 'LTE', '3G', 'PPS'];
      case 'P' : //PPS
        return ['PPS', '5G', 'LTE', '3G', '2nd'];
      default :
        return ['5G', 'LTE', '3G', '2nd', 'PPS'];
    }
  }

  private _getSeriesPlans(params) {
    return this.apiService.request(API_CMD.BFF_10_0203, params).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        groupProdList: resp.result.groupProdList.map(groupPlan => {
          return {
            ...groupPlan,
            prodList : resp.result.groupProdList.prodList.map(plan => {
              return {
                ...plan,
                basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
                basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrDataQtyCtt) ?
                  this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
                    null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
                  ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrDataQtyCtt, DATA_UNIT.GB),
                basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
                  null : ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
                basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
                tabCode: this._getTabCodeSeries(plan),
                prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
                compareYN: this._getCompareYN(this._getTabCodeSeries(plan),plan.basFeeInfo,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
              };
            })
          }
        }),
        separateProductList: resp.result.separateProductList.map(separatePlan => {
          return {
            ...separatePlan,
            basFeeAmt: ProductHelper.convProductBasfeeInfo(separatePlan.basFeeInfo),
            basOfrVcallTmsCtt: this._isEmptyAmount(separatePlan.basOfrVcallTmsCtt) ?
              null : ProductHelper.convProductBasOfrVcallTmsCtt(separatePlan.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this._isEmptyAmount(separatePlan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(separatePlan.basOfrCharCntCtt),
            basOfrDataQtyCtt: this._isEmptyAmount(separatePlan.basOfrDataQtyCtt) ?
              this._isEmptyAmount(separatePlan.basOfrMbDataQtyCtt) ?
              null : ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrMbDataQtyCtt) :
              ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrDataQtyCtt, DATA_UNIT.GB),
            tabCode: this._getTabCodeSeries(separatePlan),
            prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(separatePlan.prodSmryExpsTypCd),
            compareYN: this._getCompareYN(this._getTabCodeSeries(separatePlan),separatePlan.basFeeInfo,separatePlan.basOfrDataQtyCtt,separatePlan.basOfrVcallTmsCtt,separatePlan.basOfrCharCntCtt)
          }
        })  
      }
    })
  }

  private _getTabCodeSeries(plan) {
    for(let i = 0; plan.prodFltList.length; i++){
      if(plan.prodFltList[i].supProdFltId == 'F01120') {
        switch (plan.prodFltList[i].prodFltId) {
          case 'F01713':
            return 'prod-5g';
          case 'F01121':
            return 'prod-lte';
          case 'F01122':
            return 'prod-band';
          case 'F01124':
            return 'prod-2nd';
          case 'F01125':
            return 'prod-2nd';
        }
      }
    }
    return '';
  }

  private _getTabCodeSeperate(plan) {
    for(let i = 0; plan.filters.length; i++){
      if(plan.filters[i].supProdFltId == 'F01120') {
        switch (plan.filters[i].prodFltId) {
          case 'F01713':
            return 'prod-5g';
          case 'F01121':
            return 'prod-lte';
          case 'F01122':
            return 'prod-band';
          case 'F01124':
            return 'prod-2nd';
          case 'F01125':
            return 'prod-2nd';
        }
      }
    }
    return '';
  }

  private _getTabCodeInit(plan) {
    switch (plan.prodFltId) {
      case 'F01713':
        return 'prod-5g';
      case 'F01121':
        return 'prod-lte';
      case 'F01122':
        return 'prod-band';
      case 'F01124':
        return 'prod-2nd';
      case 'F01125':
        return 'prod-2nd';
    }
    return '';
  }

  private _parseProdSmryExpsTypCd(data) {
    switch (data) {
      case '1':
        return '1';
      case '2':
        return '3';
      case '3':
        return '2';
    }
    return '';
  }
  
  private _getM24agrmtFeeAmt(basFeeAmt,m24agrmtDcAmt) {
    if(isNaN(Number(basFeeAmt))) {
      return '';
    }
    return Number(basFeeAmt) - Number(m24agrmtDcAmt);
  }

  private _getCompareYN(code, basFeeAmt, basOfrDataQtyCtt, basOfrVcallTmsCtt, basOfrCharCntCtt) {
    if(code != 'prod-5g' && code != 'prod-lte') {
      return false;
    }
    if(basFeeAmt == '상세 참조' && basOfrDataQtyCtt == '상세 참조' && basOfrVcallTmsCtt == '상세 참조' && basOfrCharCntCtt == '상세 참조') {
      return true;
    }
    return false;
  }
}