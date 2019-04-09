/**
 * @file product.mobileplan-add.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils/product.helper';
import { PRODUCT_CODE } from '../../../../types/bff.type';

/**
 * @class
 * @desc 상품 > 모바일 부가서비스
 */
export default class ProductAddition extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} _req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this._getMyAdditions(svcInfo && svcInfo.svcAttrCd.startsWith('M')),
      this._getBestAdditions(),
      this._getRecommendedAdditions(),
      this._getRecommendedTags()
    ).subscribe(([myAdditions, bestAdditions, recommendedAdditions, recommendedTags]) => {
      const error = {
        code: (myAdditions && myAdditions.code) || bestAdditions.code || recommendedAdditions.code || recommendedTags.code,
        msg: (myAdditions && myAdditions.msg) || bestAdditions.msg || recommendedAdditions.msg || recommendedTags.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      const productData = {
        myAdditions,
        bestAdditions,
        recommendedAdditions,
        recommendedTags
      };
      res.render('mobileplan-add/product.mobileplan-add.html', { svcInfo, productData, pageInfo });
    });
  }

  /**
   * @desc 나의 가입 부가서비스 정보 요청
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
   * @desc SK텔레콤의 대표 부가서비스 요청
   * @private
   */
  private _getBestAdditions = () => {
    return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION }).map(resp => {
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
        prodList: (resp.result.prodList || []).map(addition => {
          return {
            ...addition,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(addition.basFeeInfo),
            prodIconImgUrl: addition.prodIconImgUrl && ProductHelper.getImageUrlWithCdn(addition.prodIconImgUrl)
          };
        })
      };
    });
  }

  /**
   * @desc 이런 부가서비스는 어떠세요? 요청
   * @private
   */
  private _getRecommendedAdditions = () => {
    return this.apiService.request(API_CMD.BFF_10_0028, { idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION }).map(resp => {
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
        prodList: (resp.result.prodList || []).map(addition => {
          return {
            ...addition,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(addition.basFeeInfo),
            prodIconImgUrl: addition.prodIconImgUrl && ProductHelper.getImageUrlWithCdn(addition.prodIconImgUrl)
          };
        })
      };
    });
  }

  /**
   * @desc 추천 태그 요청
   * @private
   */
  private _getRecommendedTags = () => {
    return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }
}
