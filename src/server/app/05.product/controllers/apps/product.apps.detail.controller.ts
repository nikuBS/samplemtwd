/**
 * @file product.apps.detail.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.22
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';
import { REDIS_KEY } from '../../../../types/redis.type';

const BANNER_POSITION = { // admin에서 내려오는 배너 포지션 상수
  T: 'top',
  C: 'center',
  B: 'bottom'
};

/**
 * @class
 * @desc 상품 > T 앱 > 앱 상세보기
 */
export default class ProductAppsDetail extends TwViewController {
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
    const appId = req.query.appId;

    Observable.combineLatest(this._getAppDetail(appId), this._getProductInfo(appId), this._getRecommendedApps(appId)).subscribe(
      ([app, prodInfo, apps]) => {
        const error = {
          code: app.code || apps.code,
          msg: app.msg || apps.msg
        };

        if (error.code) {
          return this.error.render(res, {
            ...error,
            pageInfo,
            svcInfo
          });
        }

        res.render('apps/product.apps.detail.html', { svcInfo, pageInfo, isApp: BrowserHelper.isApp(req), apps, app, prodInfo });
      }
    );
  }

  /**
   * @desc 앱 상세보기 정보 요청
   * @param {string} appId 앱 상품 id
   * @private
   */
  private _getAppDetail = appId => {
    return this.apiService.request(API_CMD.BFF_10_0097, { prodExpsTypCd: 'P' }, {}, [appId]).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const images: Array<string> = [],
        icon = resp.result.appIconImgUrl;
      return {
        ...resp.result,
        appIconImgUrl: icon && icon !== '' ? ProductHelper.getImageUrlWithCdn(icon) : '',
        images: (resp.result.scrshotList || []).reduce((arr, img) => {
          if (img.scrshotImgUrl && img.scrshotImgUrl !== '') {
            arr.push(ProductHelper.getImageUrlWithCdn(img.scrshotImgUrl));
          }

          return arr;
        }, images)
      };
    });
  };

  /**
   * @desc 추천 앱 가져오기 요청
   * @param {string} appId 앱 상품 id
   * @private
   */
  private _getRecommendedApps = appId => {
    return this.apiService.request(API_CMD.BFF_10_0139, {}, {}, [appId]).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return (resp.result.recommendAppList || []).map(app => {
        return {
          ...app,
          appIconImgUrl: app.appIconImgUrl && ProductHelper.getImageUrlWithCdn(app.appIconImgUrl)
        };
      });
    });
  };

  /**
   * @desc admin 상품 정보 가져오기 요청
   * @param {string} appId 앱 상품 id
   * @private
   */
  private _getProductInfo = appId => {
    return this.redisService.getData(REDIS_KEY.PRODUCT_INFO + appId).map(resp => {
      if (!resp.result) {
        return resp.result;
      }

      return {
        ...resp.result,
        banners: resp.result.banner.reduce((banners, banner) => {
          const position = BANNER_POSITION[banner.bnnrLocCd];

          if (position) {
            banners[position] = {
              ...banner,
              bnnrImgUrl: banner.bnnrImgUrl && ProductHelper.getImageUrlWithCdn(banner.bnnrImgUrl)
            };
          }

          return banners;
        }, {})
      };
    });
  }
}
