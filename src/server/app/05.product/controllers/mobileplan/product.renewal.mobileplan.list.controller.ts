
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
          ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
          ...(req.query.order ? { searchOrder: req.query.order } : {}),
          ...(req.query.tag ? { searchTagId: req.query.tag } : {})
        };
        const quickFilterCode = req.query.code ? req.query.code : '';
        const series = { //상단 요금제 분류 선택시 하이라이트를 주기 위해
          fiveGx :  '',
          lte : '',
          threeG : '',
          secondDevice : '',
          prepay : '',
          theme : '',
          noSeries : false,
          class : '',
        };
        const filterList = {
          filterList : ''
        };
        if(params.searchFltIds) {
          const seriesCode: string = this._getSeries(params.searchFltIds);
        
          switch(seriesCode) { // 상단 탭 하이라이트 적용
            case 'F01713':
              series.fiveGx = ' class=on';
              series.class = 'prod-5g';
              break;
            case 'F01121':
              series.lte = ' class=on';
              series.class = 'prod-lte';
              break;
            case 'F01122':
              series.threeG = ' class=on';
              series.class = 'prod-band';
              break;
            case 'F01124':
              series.secondDevice = ' class=on';
              series.class = 'prod-2nd';
              break;
            case 'F01125':
              series.prepay = ' class=on';
              series.class = 'prod-2nd';
              break;
            default:
              series.noSeries = true;
              break;
          }
            filterList.filterList = this._getFilterList(params.searchFltIds);
        } else {
          series.noSeries = true;
        }

        let quickFilterData = {
          filterName : '',
          filterCode : '',
          filterExist : ''
        }

        if(quickFilterCode) {
          quickFilterData.filterExist = 'Y';
          switch(quickFilterCode) {
            case 'A001' :
              quickFilterData.filterName = '데이터 완전 무제한';
              quickFilterData.filterCode = 'A001';
              break;
            case 'A002' :
              quickFilterData.filterName = '가입 즉시 T멤버십 VIP';
              quickFilterData.filterCode = 'A002';
              break;
            case 'A003' :
              quickFilterData.filterName = '무제한 음악 스트리밍 무료 이용';
              quickFilterData.filterCode = 'A003';
              break;
            default :
             break;
          }
        }
        if (req.query.theme) {
          series.theme = ' class=on';
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.theme.html', { svcInfo, params, pageInfo, series, filterList, quickFilterData });
        } else if(filterList.filterList === '' && series.prepay !== ' class=on' && quickFilterData.filterExist !== 'Y') {
          Observable.combineLatest(
            this.getNetworkInfoFilter(svcInfo) // 나의 회선의 통신망 정보 조회
          ).subscribe(([
            networkInfoFilter // 통신망 정보 결과 값
            ]) => {
              if(series.fiveGx == ' class=on'){
                res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.5g.html', { svcInfo, params, pageInfo, series, filterList, quickFilterData });
              } else if(series.lte == ' class=on') {
                res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.lte3g.html', { svcInfo, params, pageInfo, series, filterList, quickFilterData });
              } else if(series.threeG == ' class=on') {
                  res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.lte3g copy.html', { svcInfo, params, pageInfo, series, filterList, quickFilterData });
              } else if(series.secondDevice == ' class=on'){
                res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.2ndDevice.html', { svcInfo, params, pageInfo, series, filterList, quickFilterData });
              } else {
                res.render('mobileplan/renewal/list/product.renewal.mobileplan.listall.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, quickFilterData });
              }
          });   
        } else {
          if(series.noSeries) {
            params.searchCount = 100;
          }
          this._getPlans(params).subscribe(plans => {

            // TODO: resp.code 꼭 넣기

            if (plans.code) {
              this.error.render(res, {
                code: plans.code,
                msg: plans.msg,
                pageInfo: pageInfo,
                svcInfo: svcInfo
              });
            }
            
            if(plans.productCount === 0) { // 요금제 항목 없음
              res.render( 'mobileplan/renewal/list/product.renewal.mobileplan.list.nolist.html' , { svcInfo, params, pageInfo, series, filterList, plans, quickFilterData } );
            } else if(series.prepay === ' class=on' && filterList.filterList === '' && quickFilterData.filterExist !== 'Y') { // 선불 탭 선택 노 필터
              res.render( 'mobileplan/renewal/list/product.renewal.mobileplan.list.prepay.html' , { svcInfo, params, pageInfo, series, filterList, plans, quickFilterData } );
            } else if(series.noSeries && quickFilterData.filterExist !== 'Y') { // 탭 선택 없이 필터 적용
              const mobileList = [{name: '5G',code: 'F01713',exist: 'N',url:'/product/renewal/mobileplan/list?filters=F01713', class: 'prod-5g'}, // 요금제 더보기용 url 입력 / 색상을 위한 클래스 추가
                {name: 'LTE',code: 'F01121',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01121', class: 'prod-lte'},
                {name: '3G',code: 'F01122',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01122', class: 'prod-band'},
                {name: '태블릿/2nd Device',code: 'F01124',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01124', class: 'prod-2nd'},
                {name: '선불',code: 'F01125',exist: 'N', url:'/product/renewal/mobileplan/list?filters=F01125', class: 'prod-2nd'}];
              if(plans.hasNext){ //탭 선택 없이 필터 적용 시 100건을 넘어가면 API추가 호출 후 기존 상품 목록에 더해서 화면으로 가져감
                params.searchLastProdId = plans.products[99].prodId;
                this._getPlans(params).subscribe(addplans => {
                  if (addplans.code) {
                    this.error.render(res, {
                      code: addplans.code,
                      msg: addplans.msg,
                      pageInfo: pageInfo,
                      svcInfo: svcInfo
                    });
                  }
                  for( let i in addplans.products) {
                    plans.products[(Number(100) + Number(i))] = addplans.products[i];
                  }
                  plans.hasNext = addplans.hasNext;
                  
                  for( let k in mobileList ) {
                    for( let i in plans.products ) {
                      for(let m in plans.products[i].filters){
                        if(mobileList[k].code === plans.products[i].filters[m].prodFltId){
                          mobileList[k].exist = 'Y';
                        }
                      }
                    }
                  }
                  res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterall.html', { svcInfo, params, pageInfo, series, filterList, plans, mobileList, quickFilterData } );
                });
                
              } else {
                for( let k in mobileList ) {
                  for( let i in plans.products) {
                    for(let m in plans.products[i].filters){
                      if(mobileList[k].code === plans.products[i].filters[m].prodFltId){
                        mobileList[k].exist = 'Y';
                      }
                    }
                  }
                }
              
                res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterall.html', { svcInfo, params, pageInfo, series, filterList, plans, mobileList, quickFilterData } );
              }
            } else { // 탭 선택 후 필터 적용
              if(quickFilterCode){ // 임시 적용 코드
                plans.hasNext = false;
              }
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterlist.html', { svcInfo, params, pageInfo, series, filterList, plans, quickFilterData} );
            }
          });
        }
    }

      private _getPlans(params) {
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
                basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt)
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
        return Observable.of(['5G', 'LTE', '3G']);
      }
      
      return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return this.matchSvcCode(resp.result.eqpMthdCd);
        }
        
        return ['5G', 'LTE', '3G'];
      });
    }

    private matchSvcCode (code) { // 전체요금제 최초 랜딩 시 요금제 시리즈 래더링 순서
      switch(code) {
        case 'A' : //2G (3G로 표현)
          return ['3G', '5G', 'LTE'];
        case 'D' : //2G (3G로 표현)
          return ['3G', '5G', 'LTE'];
        case 'W' : //3G
          return ['3G', '5G', 'LTE'];
        case 'L' : //LTE
          return ['LTE', '5G', '3G'];
        case 'F' : //5G
          return ['5G', 'LTE', '3G'];
        default :
          return ['5G', 'LTE', '3G'];
    }

  }
}