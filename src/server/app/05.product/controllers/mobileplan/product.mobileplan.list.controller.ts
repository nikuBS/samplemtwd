/**
 * @file 리스트 < 요금제 < 상품
 * @author Jiyoung Jo
 * @since 2018.10.08
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
 * @desc 상품 > 모바일 요금제 > 리스트
 */
export default class ProductPlans extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const params = {
      idxCtgCd: PRODUCT_CODE.MOBILE_PLAN,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.order ? { searchOrder: req.query.order } : {}),
      ...(req.query.tag ? { searchTagId: req.query.tag } : {})
    };

    this._getPlans(params).subscribe(plans => {
      if (plans.code) {
        this.error.render(res, {
          code: plans.code,
          msg: plans.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      res.render('mobileplan/product.mobileplan.list.html', { svcInfo, plans, params, pageInfo });
    });
  }

  /**
   * @desc 리스트 가져오기 요청
   * @param {object} params 적용된 필터 및 태그
   * @private
   */
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

  /**
   * @desc BFF 데이터 빈값 여부 확인
   * @param {string} value 음성, 문자, 데이터 값
   * @private
   */
  private _isEmptyAmount(value: string) {
    return !value || value === '' || value === '-';
  }
}
