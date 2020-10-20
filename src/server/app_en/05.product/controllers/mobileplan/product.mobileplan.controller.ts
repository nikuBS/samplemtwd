/**
 * @file 요금제 < 상품
 * @author Jiyoung Jo
 * @since 2018.09.06
 */

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types_en/api-command.type';
import FormatHelper from '../../../../utils_en/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils_en/product.helper';
import { PRODUCT_CODE } from '../../../../types_en/bff.type';

/**
 * @class
 * @desc 상품 > 모바일 요금제 
 */
export default class MobilePlan extends TwViewController {
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
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this._getProductGroups(),
    ).subscribe(([productData]) => {    
      const error = {
        code: productData.code,
        msg: productData.msg 
      };
 
      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }     

      for(let t in productData.grpProdList) {
        console.log('#######>> ' + t , productData.grpProdList[t]);
      };

      res.render('mobileplan/en.product.mobileplan.html', { svcInfo, pageInfo, productData, 'isSubscribed': svcInfo || false});
    });
  }

  /**
   * @desc 많이 찾는 요금제 요청
   * @private
   */
  private _getProductGroups = () => {
    return this.apiService.request(
      {path: '/core-product/v1/submain/global-grpprods', method: 'GET', server: 'BFF_SERVER', bypass: false},
      { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {

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
        grpProdList: resp.result.grpProdList.map(group => {
          return {
            ...group,
            prodGrpFlagImgUrl: group.prodGrpFlagImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpFlagImgUrl),
            prodGrpIconImgUrl: group.prodGrpIconImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpIconImgUrl),
            prodList: group.prodList.map(plan => {
              return {
                ...plan,
                basFeeInfo: ProductHelper.convProductBasfeeInfo(plan.basFeeEngInfo)
              };
            })
          };
        })
      };
    });
  }
}
