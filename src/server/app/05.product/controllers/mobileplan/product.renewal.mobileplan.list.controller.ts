
/**
 * @file 리스트 < 요금제 < 전체 리스트
 * @author 
 * @since 2020.12.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { PRODUCT_CODE } from '../../../../types/bff.type';

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
        console.log("@@@@@@",params);
        const series = { //상단 요금제 분류 선택시 하이라이트를 주기 위해
          fiveGx :  '',
          lte : '',
          threeG : '',
          secondDevice : '',
          prepay : '',
          theme : ''
        };
        const filterList = {
          filterList : ''
        }
        if(params.searchFltIds){
          filterList.filterList = this._getFilterList(params.searchFltIds);
        }
        if (req.query.theme) {
          series.theme = ' class=on';
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.theme.html', { svcInfo, params, pageInfo, series, filterList });
        } else if(!req.query.filters) {
          res.render('mobileplan/renewal/list/product.renewal.mobileplan.listall.html', { svcInfo, params, pageInfo, series, filterList });
        } else {
          let seriesCode: string = this._getSeries(params.searchFltIds);
          switch(seriesCode) {
            case 'F01713':
              series.fiveGx = ' class=on';
              break;
            case 'F01121':
              series.lte = ' class=on';
              break;
            case 'F01122':
              series.threeG = ' class=on';
              break;
            case 'F01124':
              series.secondDevice = ' class=on';
              break;
            case 'F01125':
              series.prepay = ' class=on';
              break;
            default:
              break;
          }
          // this._getPlans(params).subscribe(plans => {
          //   if (plans.code) {
          //     this.error.render(res, {
          //       code: plans.code,
          //       msg: plans.msg,
          //       pageInfo: pageInfo,
          //       svcInfo: svcInfo
          //     });
          //   }
              res.render('mobileplan/renewal/list/product.renewal.mobileplan.list.html', { svcInfo, params, pageInfo, series, filterList });
          // });
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
                basOfrCharCntCtt: this._isEmptyAmount(plan.basOfrCharCntCtt) ? null : ProductHelper.convProductBasOfrCharCntCtt(plan.basOfrCharCntCtt),
                filters: plan.filters.filter((filter, idx, filters) => {
                  // 기기, 데이터, 대상 필터 1개씩만 노출
                  return filters.findIndex(item => item.supProdFltId === filter.supProdFltId) === idx && /^F011[2|3|6]0$/.test(filter.supProdFltId);
                })
              };
            })
          };
        });
      }

    private _isEmptyAmount(value: string) {
      return !value || value === '' || value === '-';
    }

    private _getSeries(searchFltIds): string {
      console.log("@@@@@@@",searchFltIds);
      let splitCheck = searchFltIds.split(',');
      console.log("@@@@@@@",splitCheck);
      let splitSeries: string[] = [];
      splitSeries = splitCheck.filter(split => (split==='F01713' || split==='F01121' || split==='F01122' || split==='F01124' || split==='F01125'));
      if(splitSeries[0]){
        return splitSeries[0];
      }
      
      return '';
    }

    private _getFilterList(searchFltIds): string {
      let splitCheck = searchFltIds.split(',');
      let splitFilter = splitCheck.filter(split => !(split==='F01713' || split==='F01121' || split==='F01122' || split==='F01124' || split==='F01125'));
      let splitString : string = '';
      for(let a=0; a<splitFilter.length; a++) {
        splitString += ',';
        splitString += splitFilter[a];
      }
      return splitString;
    }

}