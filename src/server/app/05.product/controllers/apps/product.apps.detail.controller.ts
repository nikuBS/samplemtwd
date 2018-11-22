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
import { APP_DETAIL } from '../../../../mock/server/product.apps.mock';

export default class ProductAppsDetail extends TwViewController {
  private BANNER_POSITION = {
    T: 'top',
    C: 'center',
    B: 'bottom'
  };

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const appId = req.params.appId;

    Observable.combineLatest(this.getProductInfo(appId), this.getRecommendedApps(appId)).subscribe(([prodInfo, apps]) => {
      const app: any = this.getAppDetail(appId);

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
    });
  }

  private getAppDetail = appId => {
    // return this.apiService.request(API_CMD.BFF_10_0097, {}, {}, appId).map(resp => {
    const resp = APP_DETAIL;
    if (resp.code !== API_CODE.CODE_00) {
      return resp;
    }

    return resp.result;
    // });
  }

  private getRecommendedApps = appId => {
    return this.apiService.request(API_CMD.BFF_10_0006, { prodId: appId }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result.recommendAppList || [];
    });
  }

  private getProductInfo = appId => {
    return this.redisService.getData('ProductLedger:' + appId).map(resp => {
      if (!resp) {
        return resp;
      }

      return {
        ...resp,
        banners: resp.banner.reduce((banners, banner) => {
          const position = this.BANNER_POSITION[banner.bnnrLocCD];

          if (position) {
            banners[position] = banner;
          }

          return banners;
        }, {})
      };
    });
  }
}
