/**
 * FileName: product.apps.detail.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { APP_DETAIL, APP_DETAIL2 } from '../../../../mock/server/product.apps.mock';
import { REDIS_PRODUCT_INFO } from '../../../../types/redis.type';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductAppsDetail extends TwViewController {
  private BANNER_POSITION = {
    T: 'top',
    C: 'center',
    B: 'bottom'
  };

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const appId = req.query.appId;

    Observable.combineLatest(this.getAppDetail(appId), this.getProductInfo(appId), this.getRecommendedApps(appId)).subscribe(
      ([app, prodInfo, apps]) => {
        const error = {
          code: app.code || apps.code,
          msg: app.msg || apps.msg
        };

        if (error.code) {
          return this.error.render(res, {
            ...error,
            svcInfo
          });
        }

        res.render('apps/product.apps.detail.html', { svcInfo, pageInfo, isApp: BrowserHelper.isApp(req), apps, app, prodInfo });
      }
    );
  }

  private getAppDetail = appId => {
    return this.apiService.request(API_CMD.BFF_10_0097, { prodExpsTypCd: 'P' }, {}, appId).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const images: Array<string> = [];
      return {
        ...resp.result,
        images: (resp.result.scrshotList || []).reduce((arr, img) => {
          if (img.scrshotImgUrl && img.scrshotImgUrl !== '') {
            arr.push(ProductHelper.getImageUrlWithCdn(img.scrshotImgUrl));
          }

          return arr;
        }, images)
      };
    });
  }

  private getRecommendedApps = appId => {
    return this.apiService.request(API_CMD.BFF_10_0139, {}, {}, appId).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result.recommendAppList || [];
    });
  }

  private getProductInfo = appId => {
    return this.redisService.getData(REDIS_PRODUCT_INFO + appId).map(resp => {
      if (!resp.result) {
        return resp.result;
      }

      return {
        ...resp.result,
        banners: resp.result.banner.reduce((banners, banner) => {
          const position = this.BANNER_POSITION[banner.bnnrLocCD];

          if (position) {
            banners[position] = {
              ...banner,
              bnnrImgUrl: ProductHelper.getImageUrlWithCdn(banner.bnnrImgUrl)
            };
          }

          return banners;
        }, {})
      };
    });
  }
}
