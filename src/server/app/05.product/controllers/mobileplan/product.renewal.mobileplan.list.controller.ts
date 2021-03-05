
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
    const params: any = {};
    const cdn = this._getCDN();
    const series = { //상단 요금제 분류 선택시 하이라이트를 주기 위해
      seriesCode : '',
      theme : '',
      noSeries : false,
      seriesClass : '',
    };
    const filterList = {
      filterList : ''
    };
    let isCompare = '';

    if(req.query.filters) {
      const seriesCode: string = this._getSeries(req.query.filters);
      series.seriesCode = seriesCode;
      switch(seriesCode) { // 상단 탭 하이라이트 적용
        case 'F01713':
          series.seriesClass = 'prod-5g';
          break;
        case 'F01121':
          series.seriesClass = 'prod-lte';
          break;
        case 'F01122':
          series.seriesClass = 'prod-band';
          break;
        case 'F01124':
          series.seriesClass = 'prod-2nd';
          break;
        case 'F01125':
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
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this.isCompareButton(svcInfo),
        this._getTabList()
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        compareData,
        tabList
        ]) => {
            if(req.query.theme) {
              params.idxCtgCd = 'F01180';
              params.opClCd = '01';
            } else if(this._getSeries(req.query.filters) === '') {
              params.idxCtgCd = networkInfoFilter[0];
              params.opClCd = '02';
            } else {
              params.opClCd = '02';
            }
            if(typeof(compareData) == 'string') {
              isCompare = 'N';
            } else {
              isCompare = 'Y';
            }
          Observable.combineLatest(
            this._getSeriesPlans(params),
          ).subscribe(([
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
            plans.isCompare = isCompare;
            for(let i in plans.groupProdList) {
              plans.groupProdList[i].prodList = this._getCompareYN(plans.groupProdList[i].prodList, networkInfoFilter[0], isCompare);
            }
            plans.separateProductList = this._getCompareYN(plans.separateProductList, networkInfoFilter[0], isCompare);
            if(req.query.theme) {
            series.theme = ' class=on';
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.theme.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            } else if (series.seriesCode == 'F01713') {
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.5g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            } else if(series.seriesCode == 'F01121' || series.seriesCode == 'F01122') {
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.lte3g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            } else if(series.seriesCode == 'F01124') {
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.2ndDevice.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            } else if(series.seriesCode == 'F01125') {
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.prepay.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            } else {
              switch(networkInfoFilter[0]){
                case 'F01713':
                  plans.series = '1';
                  break;
                case 'F01121':
                  plans.series = '2';
                  break;
                case 'F01122':
                  plans.series = '4';
                  break;
                case 'F01124':
                  plans.series = '3';
                  break;
                case 'F01125':
                  plans.series = '3';
                  break;
                default : 
                  plans.series = '1';
              }
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.listall.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn, tabList, compareData });
            }
          });
        });
    } else if (series.noSeries === true) {
      params.searchFltIds =  req.query.filters;
      params.idxCtgCd = 'F01100';
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getInitPlans(params),
        this.isCompareButton(svcInfo),
        this._getTabList()
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans,
        compareData,
        tabList
        ]) => {
          let isCompare: string = '';
          if(compareData != 'N'){
            isCompare = 'Y'
          } else {
            isCompare = 'N'
          }
          if (plans.code) {
            this.error.render(res, {
              code: plans.code,
              msg: plans.msg,
              pageInfo: pageInfo,
              svcInfo: svcInfo
            });
          }
          plans.isCompare = isCompare;
          plans.products = this._getCompareYN(plans.products, networkInfoFilter[0], isCompare);
          let mobileList: any = [];
          for(let i in tabList.subFilters) {
            mobileList[i] = 
              {
              name: tabList.subFilters[i].prodFltNm,
              code: tabList.subFilters[i].prodFltId,
              exist: 'N',
              url:'/product/renewal/mobileplan/list?filters=' + tabList.subFilters[i].prodFltId
              };
          }

          for( let k in mobileList ) {
            for( let i in plans.products) {
              if(mobileList[k].name === plans.products[i].prodFltNm){
                mobileList[k].exist = 'Y';
              }
            }
          }
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterall.html', { svcInfo, params, pageInfo, series, filterList, plans, mobileList, networkInfoFilter, cdn, tabList, compareData } );
        });

    } else {
      params.idxCtgCd = 'F01100';
      params.searchFltIds = req.query.filters;
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getSeperatePlans(params),
        this.isCompareButton(svcInfo),
        this._getTabList()
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans,
        compareData,
        tabList
        ]) => {
         let isCompare: string = '';
          if(compareData != 'N') {
            isCompare = 'Y'
          } else {
            isCompare = 'N'
          }  
        if (plans.code) {
          this.error.render(res, {
            code: plans.code,
            msg: plans.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
        plans.isCompare = isCompare;
        plans.products = this._getCompareYN(plans.products, networkInfoFilter[0], isCompare);
        if(plans.productCount === 0) { // 요금제 항목 없음
          res.render( 'mobileplan/renewal/list/product.renewal.mobileplan.list.nolist.html' , { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter, cdn, tabList, compareData } );
        } else if(series.noSeries == false) { // 탭 선택 후 필터 적용
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterlist.html', { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter, cdn, tabList, compareData } );
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
      for(var i in resp.result.products){
        console.log(resp.result.products[i]);
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
            benefitList: this._parseBenefitList(plan.benefitList)
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
            tabCode: this._getTabCodeSeries(plan.filters),
            prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
            benefitList: this._parseBenefitList(plan.benefitList)
          };
        })
      };
    });
  }

  private _isEmptyAmount(value: any) {
    return !value || value === '' || value === '-';
  }

  private _getSeries(searchFltIds): string { // 탭 정보 얻어옴
    if(!searchFltIds) {
      return '';
    }
    const splitCheck: string[] = searchFltIds.split(',');
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
      return Observable.of(['F01713', 'F01121', 'F01122', 'F01124', 'F01125']);
    }

    if ( svcInfo.svcGr === 'P' ) { // 선택한 회선이 선불폰(PPS) 라면 P
      return Observable.of(['F01125', 'F01713', 'F01121', 'F01122', 'F01124']);
    }
    
    return this.apiService.request(API_CMD.BFF_05_0220, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {

        if ( resp.result.beqpMclEqpClSysCd !== '0101000' ) {
          return this.matchSvcCode('E');
        }
        return this.matchSvcCode(resp.result.eqpMthdCd);
      }
      return ['F01713', 'F01121', 'F01122', 'F01124', 'F01125'];
    });
  }

  private matchSvcCode (code) { // 전체요금제 최초 랜딩 시 요금제 시리즈 래더링 순서
    
    switch(code) {
      case 'A' : //2G (3G로 표현)
        return ['F01122', 'F01713', 'F01121', 'F01124', 'F01125'];
      case 'D' : //2G (3G로 표현)
        return ['F01122', 'F01713', 'F01121', 'F01124', 'F01125'];
      case 'W' : //3G
        return ['F01122', 'F01713', 'F01121', 'F01124', 'F01125'];
      case 'L' : //LTE
        return ['F01121', 'F01713', 'F01122', 'F01124', 'F01125'];
      case 'F' : //5G
        return ['F01713', 'F01121', 'F01122', 'F01124', 'F01125'];
      case 'E' : //2nd Device
        return ['F01124', 'F01713', 'F01121', 'F01122', 'F01125'];
      case 'P' : //PPS
        return ['F01125', 'F01713', 'F01121', 'F01122', 'F01124'];
      default :
        return ['F01713', 'F01121', 'F01122', 'F01124', 'F01125'];
    }
    return ['F01713', 'F01121', 'F01122', 'F01124', 'F01125'];
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
      if(resp.result.separateProductList && resp.result.groupProdList) {
        return {
          ...resp.result,
          groupProdList: resp.result.groupProdList.map(groupPlan => {
            return {
              ...groupPlan,
              prodList : groupPlan.prodList.map(plan => {
                return {
                  ...plan,
                  basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
                  basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrGbDataQtyCtt) ?
                    this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
                      null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
                    ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
                  basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
                    null : ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
                  basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
                  tabCode: this._getTabCodeSeries(plan.prodFltList),
                  prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
                  benefitList: this._parseBenefitList(plan.benefitList)
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
              basOfrDataQtyCtt: this._isEmptyAmount(separatePlan.basOfrGbDataQtyCtt) ?
                this._isEmptyAmount(separatePlan.basOfrMbDataQtyCtt) ?
                null : ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrMbDataQtyCtt) :
                ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
              tabCode: this._getTabCodeSeries(separatePlan.prodFltList),
              prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(separatePlan.prodSmryExpsTypCd),
              benefitList: this._parseBenefitList(separatePlan.benefitList)
            }
          })
        }
      } else if (resp.result.rcnProductList) {
        return {
          ...resp.result,
          separateProductList: resp.result.separateProductList.map(separatePlan => {
            return {
              ...separatePlan,
              basFeeAmt: ProductHelper.convProductBasfeeInfo(separatePlan.basFeeInfo),
              basOfrVcallTmsCtt: this._isEmptyAmount(separatePlan.basOfrVcallTmsCtt) ?
                null : ProductHelper.convProductBasOfrVcallTmsCtt(separatePlan.basOfrVcallTmsCtt, false),
              basOfrCharCntCtt: this._isEmptyAmount(separatePlan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(separatePlan.basOfrCharCntCtt),
              basOfrDataQtyCtt: this._isEmptyAmount(separatePlan.basOfrGbDataQtyCtt) ?
                this._isEmptyAmount(separatePlan.basOfrMbDataQtyCtt) ?
                null : ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrMbDataQtyCtt) :
                ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
              tabCode: this._getTabCodeSeries(separatePlan.prodFltList),
              prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(separatePlan.prodSmryExpsTypCd),
              benefitList: this._parseBenefitList(separatePlan.benefitList)
            }
          }),
          rcnProductList: resp.result.rcnProductList.map(rcnPlan => {
            return {
              ...rcnPlan,
              prodSmryExpTypeCd: this._parseProdSmryExpsTypCd(rcnPlan.prodSmryExpTypeCd)
            }
          })
        }
      } else if (!resp.result.groupProdList) {
        return {
          ...resp.result,
          separateProductList: resp.result.separateProductList.map(separatePlan => {
            return {
              ...separatePlan,
              basFeeAmt: ProductHelper.convProductBasfeeInfo(separatePlan.basFeeInfo),
              basOfrVcallTmsCtt: this._isEmptyAmount(separatePlan.basOfrVcallTmsCtt) ?
                null : ProductHelper.convProductBasOfrVcallTmsCtt(separatePlan.basOfrVcallTmsCtt, false),
              basOfrCharCntCtt: this._isEmptyAmount(separatePlan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(separatePlan.basOfrCharCntCtt),
              basOfrDataQtyCtt: this._isEmptyAmount(separatePlan.basOfrGbDataQtyCtt) ?
                this._isEmptyAmount(separatePlan.basOfrMbDataQtyCtt) ?
                null : ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrMbDataQtyCtt) :
                ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
              tabCode: this._getTabCodeSeries(separatePlan.prodFltList),
              prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(separatePlan.prodSmryExpsTypCd),
              benefitList: this._parseBenefitList(separatePlan.benefitList)
            }
          })
        }
      } else {
        return {
          ...resp.result,
          groupProdList: resp.result.groupProdList.map(groupPlan => {
            return {
              ...groupPlan,
              prodList : groupPlan.prodList.map(plan => {
                return {
                  ...plan,
                  basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
                  basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrGbDataQtyCtt) ?
                    this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
                      null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
                    ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
                  basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
                    null : ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
                  basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
                  tabCode: this._getTabCodeSeries(plan.prodFltList),
                  prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
                  benefitList: this._parseBenefitList(plan.benefitList)
                };
              })
            }
          })
        }
      }
    })
  }

  private _getTabCodeSeries(prodFltList) {
      if(!prodFltList) {
        return '';
      }
      for(let i = 0; i < prodFltList.length; i++){ 
        if(prodFltList[i].supProdFltId == 'F01120') {
          switch (prodFltList[i].prodFltId) { 
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
            default :
              return '';
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
      case 'TAG0000212' :
        return '1';
      case 'TAG0000213' :
        return '3';
      case 'TAG0000214' :
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

  private isCompareButton(svcInfo: any): Observable<any> {
    // 로그인이 안되어있다면? 
    if ( !svcInfo ) { 
      return Observable.of('N');
    }

     // 무선회선이 아니라면?
   return Observable.combineLatest(
      this.getExistsMyProductPLM() // 나의 상품에 해당되는 PLM 정보를 얻음
      , this.getExistsMyProductRedis(svcInfo) // 나의 상품에 해당되는 혜택 정보를 얻음
    ).map(([isExistsPLMData, isExistsRedisData]) => {

      // 문자 사용량에 대한 데이터가 없고 전화 데이터가 없고 데이터 대한 데이터가 없는지에 대해 체크한 값
      if ( isExistsPLMData || isExistsRedisData ) { 
        return isExistsPLMData;
      }

      return 'N';
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

        return data;
      }
      return false;
    });
  }

    /**
     * 나의 요금제의 어드민 등록 혜택이 있는지 체크 (Redis)
     * @param svcInfo 
     */
    private getExistsMyProductRedis(svcInfo: any): Observable<any> {
      const prodId = svcInfo.prodId; // 나의 회선에 해당되는 상품 코드

      return this.redisService.getData('BenfProdInfo:' + prodId).map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( resp.result.benfProdInfo && resp.result.benfProdInfo.length > 0 ) {
            return true;
          }
        } 
        return false;
      });
    }

  private _getCompareYN(prodList, networkInfo, isCompare) {
    for(var i in prodList){
      if(((prodList[i].tabCode == 'prod-5g') && (networkInfo == 'F01713')) || ((prodList[i].tabCode == 'prod-lte') && (networkInfo == 'F01121'))){
        prodList[i].compareYN = true;
      } else {
        prodList[i].compareYN = false;
      }
      if(isCompare == 'N'){
        prodList[i].compareYN = false;
      }
    }
    return prodList;
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

  private _getTabList() : Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0032, {idxCtgCd:'F01100'}).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }
      for(let i in resp.result.filters) {
        if (resp.result.filters[i].prodFltId == 'F01120') {
          return resp.result.filters[i];
        }
      }
      return null;
    });
  }

  private _parseBenefitList(benefitList) {
    let list = {chooseBenefitList :[{}],sepBenefitList:[{}]};
    for(let i in benefitList) {
      if(benefitList[i].useAmt) {
        benefitList[i].useAmt = ProductHelper.convProductBasfeeInfo(benefitList[i].useAmt);
        benefitList[i].benfAmt = ProductHelper.convProductBasfeeInfo(benefitList[i].benfAmt);
      }
      if(benefitList[i].prodBenfTypCd == '02') {
        list.chooseBenefitList.push(benefitList[i]);
      } else {
        list.sepBenefitList.push(benefitList[i]);
      }
    }
    list.chooseBenefitList.shift();
    list.sepBenefitList.shift();
    console.log("chooseBenefitList",list.chooseBenefitList);
    console.log("sepBenefitList",list.sepBenefitList);
    return list;
  }

  private _getCDN() {
    const env = String(process.env.NODE_ENV);
    if ( env === 'prd' ) { // 운영
      return 'https://cdnm.tworld.co.kr';
    } else if ( env === 'stg' ) { // 스테이징
      return 'https://cdnm-stg.tworld.co.kr';
    } else if ( env === 'dev') { // dev
      return 'https://cdnm-dev.tworld.co.kr';
    } else { // local
      return 'https://cdnm-dev.tworld.co.kr';
      // return 'http://localhost:3001';
    }
  }
}

