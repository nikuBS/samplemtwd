
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
        params.opClCd = '01';
      } else if(this._getSeries(req.query.filters) === '') {
        params.idxCtgCd = 'F01120';
        params.opClCd = '01';
      } else {
        params.opClCd = '02';
      }
      console.log(params);
      Observable.combineLatest(
        this.getNetworkInfoFilter(svcInfo), // 나의 회선의 통신망 정보 조회
        this._getSeriesPlans(params)
      ).subscribe(([
        networkInfoFilter, // 통신망 정보 결과 값
        plans
        ]) => {         
          if(req.query.theme) {
          series.theme = ' class=on';
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.theme.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn});
          } else if (series.fiveGx == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.5g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn });
          } else if(series.lte == ' class=on' || series.threeG == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.lte3g.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn });
          } else if(series.secondDevice == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.2ndDevice.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn });
          } else if(series.prepay == ' class=on') {
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.prepay.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn });
          } else {
            let _gPlans : any = []; 
            let _sPlans : any = [];

            
            for(let i = 0; i < plans.groupProdList.length ; i++){
              for(let j = 0; j < plans.groupProdList[i].prodList[0].prodFltList.length ; j++) {
                  if( plans.groupProdList[i].prodList[0].prodFltList[j].prodFltId == networkInfoFilter[0] ) {
                    _gPlans.push(plans.groupProdList[i]);
                  }
              }
            }
            for(let i = 0; i < plans.separateProductList.length; i++){
              for(let j = 0; j < plans.separateProductList[i].prodFltList.length; j++){
                if(plans.separateProductList[i].prodFltList[j].prodFltId == networkInfoFilter[0]) {
                  _sPlans.push(plans.separateProductList[i]);
                }
              }
            }
            plans.groupProdList = _gPlans;
            plans.separateProductList = _sPlans;
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
            console.log(plans.groupProdList[1].prodList);
            
            
            res.render('mobileplan/renewal/list/product.renewal.mobileplan.listall.html', { svcInfo, params, pageInfo, series, filterList, networkInfoFilter, plans, cdn });
          }
        });   
    } else if (series.noSeries === true) {
      params.searchFltIds =  req.query.filters;
      params.idxCtgCd = 'F01120';
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
              if(mobileList[k].name === plans.products[i].prodFltNm){
                mobileList[k].exist = 'Y';
              }
            }
          }
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterall.html', { svcInfo, params, pageInfo, series, filterList, plans, mobileList, networkInfoFilter, cdn } );
        });

    } else {
      params.idxCtgCd = 'F01120';
      params.searchFltIds = req.query.filters;
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
          res.render( 'mobileplan/renewal/list/product.renewal.mobileplan.list.nolist.html' , { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter, cdn } );
        } else if(series.noSeries == false) { // 탭 선택 후 필터 적용
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.filterlist.html', { svcInfo, params, pageInfo, series, filterList, plans, networkInfoFilter, cdn } );
        } 
      });
    }
  } 

  private _getInitPlans(params) {
    return this.apiService.request(API_CMD.BFF_10_0205, params).map(resp => {
    // return  Observable.of(data205).map(resp => {
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
            tabCode: this._getTabCodeSeries(plan.filters),
            prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
            compareYN: this._getCompareYN(this._getTabCodeSeries(plan.filters),plan.basFeeAmt,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
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
      // for(let i in resp.result.groupProdList){
      //   for(let j in resp.result.groupProdList[i].prodList[0].prodFltList){
      //     if(resp.result.groupProdList[i].prodList[0].prodFltList[j].prodFltId == 'F01121') {
      //       console.log(resp.result.groupProdList[i].prodGrpNm,"@@@@",resp.result.groupProdList[i].prodList[0].prodFltList[j]);
      //     }
      //   }
      // }
      
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
                  compareYN: this._getCompareYN(this._getTabCodeSeries(plan.prodFltList),plan.basFeeInfo,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
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
              compareYN: this._getCompareYN(this._getTabCodeSeries(separatePlan.prodFltList),separatePlan.basFeeInfo,separatePlan.basOfrDataQtyCtt,separatePlan.basOfrVcallTmsCtt,separatePlan.basOfrCharCntCtt)
            }
          })
          // rcnProdList: resp.result.rcnProdList.map(rcnPlan => {
          //   return {
          //     ...rcnPlan,
          //     prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(rcnPlan.prodSmryExpsTypCd)
          //   }
          // })
        }
      } else if (resp.result.rcnProductList) {
        return {
          ...resp.result,
          // groupProdList: resp.result.groupProdList.map(groupPlan => {
          //   return {
          //     ...groupPlan,
          //     prodList : groupPlan.prodList.map(plan => {
          //       return {
          //         ...plan,
          //         basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
          //         basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrGbDataQtyCtt) ?
          //           this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
          //             null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
          //           ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
          //         basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
          //           null : ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
          //         basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
          //         tabCode: this._getTabCodeSeries(plan.prodFltList),
          //         prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
          //         compareYN: this._getCompareYN(this._getTabCodeSeries(plan.prodFltList),plan.basFeeInfo,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
          //       };
          //     })
          //   }
          // }),
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
              compareYN: this._getCompareYN(this._getTabCodeSeries(separatePlan.prodFltList),separatePlan.basFeeInfo,separatePlan.basOfrDataQtyCtt,separatePlan.basOfrVcallTmsCtt,separatePlan.basOfrCharCntCtt)
            }
          }),
          rcnProductList: resp.result.rcnProductList.map(rcnPlan => {
            return {
              ...rcnPlan,
              prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(rcnPlan.prodSmryExpsTypCd)
            }
          })
        }
      } else if (!resp.result.groupProdList) {
        return {
          ...resp.result,
          // groupProdList: resp.result.groupProdList.map(groupPlan => {
          //   return {
          //     ...groupPlan,
          //     prodList : groupPlan.prodList.map(plan => {
          //       return {
          //         ...plan,
          //         basFeeAmt: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
          //         basOfrDataQtyCtt: this._isEmptyAmount(plan.basOfrGbDataQtyCtt) ?
          //           this._isEmptyAmount(plan.basOfrMbDataQtyCtt) ?
          //             null : ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrMbDataQtyCtt) :
          //           ProductHelper.convProductBasOfrDataQtyCtt(plan.basOfrGbDataQtyCtt, DATA_UNIT.GB),
          //         basOfrVcallTmsCtt: this._isEmptyAmount(plan.basOfrVcallTmsCtt) ?
          //           null : ProductHelper.convProductBasOfrVcallTmsCtt(plan.basOfrVcallTmsCtt, false),
          //         basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
          //         tabCode: this._getTabCodeSeries(plan.prodFltList),
          //         prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(plan.prodSmryExpsTypCd),
          //         compareYN: this._getCompareYN(this._getTabCodeSeries(plan.prodFltList),plan.basFeeInfo,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
          //       };
          //     })
          //   }
          // }),
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
              compareYN: this._getCompareYN(this._getTabCodeSeries(separatePlan.prodFltList),separatePlan.basFeeInfo,separatePlan.basOfrDataQtyCtt,separatePlan.basOfrVcallTmsCtt,separatePlan.basOfrCharCntCtt)
            }
          })
          // rcnProdList: resp.result.rcnProdList.map(rcnPlan => {
          //   return {
          //     ...rcnPlan,
          //     prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(rcnPlan.prodSmryExpsTypCd)
          //   }
          // })
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
                  compareYN: this._getCompareYN(this._getTabCodeSeries(plan.prodFltList),plan.basFeeInfo,plan.basOfrDataQtyCtt,plan.basOfrVcallTmsCtt,plan.basOfrCharCntCtt)
                };
              })
            }
          })
          // separateProductList: resp.result.separateProductList.map(separatePlan => {
          //   return {
          //     ...separatePlan,
          //     basFeeAmt: ProductHelper.convProductBasfeeInfo(separatePlan.basFeeInfo),
          //     basOfrVcallTmsCtt: this._isEmptyAmount(separatePlan.basOfrVcallTmsCtt) ?
          //       null : ProductHelper.convProductBasOfrVcallTmsCtt(separatePlan.basOfrVcallTmsCtt, false),
          //     basOfrCharCntCtt: this._isEmptyAmount(separatePlan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(separatePlan.basOfrCharCntCtt),
          //     basOfrDataQtyCtt: this._isEmptyAmount(separatePlan.basOfrDataQtyCtt) ?
          //       this._isEmptyAmount(separatePlan.basOfrMbDataQtyCtt) ?
          //       null : ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrMbDataQtyCtt) :
          //       ProductHelper.convProductBasOfrDataQtyCtt(separatePlan.basOfrDataQtyCtt, DATA_UNIT.GB),
          //     tabCode: this._getTabCodeSeries(separatePlan.prodFltList),
          //     prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(separatePlan.prodSmryExpsTypCd),
          //     compareYN: this._getCompareYN(this._getTabCodeSeries(separatePlan.prodFltList),separatePlan.basFeeInfo,separatePlan.basOfrDataQtyCtt,separatePlan.basOfrVcallTmsCtt,separatePlan.basOfrCharCntCtt)
          //   }
          // })
          // rcnProdList: resp.result.rcnProdList.map(rcnPlan => {
          //   return {
          //     ...rcnPlan,
          //     prodSmryExpsTypCd: this._parseProdSmryExpsTypCd(rcnPlan.prodSmryExpsTypCd)
          //   }
          // })
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
    switch (plan.prodFltNm) {
      case '5G':
        return 'prod-5g';
      case 'LTE':
        return 'prod-lte';
      case '3G':
        return 'prod-band';
      case '태블릿/2nd device':
        return 'prod-2nd';
      case '선불':
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

  private _getCompareYN(code, basFeeAmt, basOfrDataQtyCtt, basOfrVcallTmsCtt, basOfrCharCntCtt) {
    if(code != 'prod-5g' && code != 'prod-lte') {
      return false;
    }
    if(basFeeAmt == '상세 참조' && basOfrDataQtyCtt == '상세 참조' && basOfrVcallTmsCtt == '상세 참조' && basOfrCharCntCtt == '상세 참조') {
      return true;
    }
    return false;
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

