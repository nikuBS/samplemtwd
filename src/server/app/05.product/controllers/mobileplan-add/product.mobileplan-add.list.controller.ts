/**
 * @file product.mobileplan-add.list.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { PRODUCT_CODE } from '../../../../types/bff.type';

/**
 * @class
 * @desc 상품 > 모바일 부가서비스 > 리스트
 */
export default class ProductAdditions extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
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
      idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.order ? { searchOrder: req.query.order } : {}),
      ...(req.query.tag ? { searchTagId: req.query.tag } : {})
    };

    Observable.combineLatest(this._getMyAdditions(svcInfo && svcInfo.svcAttrCd.startsWith('M')), this._getAdditions(params)).subscribe(
      ([myAdditions, additions]) => {
        const error = {
          code: (myAdditions && myAdditions.code) || additions.code,
          msg: (myAdditions && myAdditions.msg) || additions.msg
        };

        if (error.code) {
          return this.error.render(res, { ...error, pageInfo, svcInfo });
        }

        res.render('mobileplan-add/product.mobileplan-add.list.html', { svcInfo, additionData: { myAdditions, additions }, params, pageInfo });
      }
    );
  }

  /**
   * @desc 나의 가입 부가서비스 요청
   * @private
   */
  private _getMyAdditions = isLogin => {
    if (isLogin) {
      return this.apiService.request(API_CMD.BFF_05_0166, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return {
            code: resp.code,
            msg: resp.msg
          };
        }

        return resp.result;
      });
    }

    return of(undefined);
  }

  /**
   * @desc 부가서비스 리스트 요청
   * @param {object} params 필터 or 태그 파라미터
   * @private
   */
  private _getAdditions = params => {
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
        products: resp.result.products.map(addition => {
          return {
            ...addition,
            basFeeAmt: ProductHelper.convProductBasfeeInfo(addition.basFeeAmt),
            basOfrDataQtyCtt: this._isEmptyAmount(addition.basOfrDataQtyCtt)
              ? this._isEmptyAmount(addition.basOfrMbDataQtyCtt)
                ? null
                : ProductHelper.convProductBasOfrDataQtyCtt(addition.basOfrMbDataQtyCtt)
              : ProductHelper.convProductBasOfrDataQtyCtt(addition.basOfrDataQtyCtt, DATA_UNIT.GB),
            basOfrVcallTmsCtt: this._isEmptyAmount(addition.basOfrVcallTmsCtt)
              ? null
              : ProductHelper.convProductBasOfrVcallTmsCtt(addition.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this._isEmptyAmount(addition.basOfrCharCntCtt)
              ? null
              : ProductHelper.convProductBasOfrCharCntCtt(addition.basOfrCharCntCtt)
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
