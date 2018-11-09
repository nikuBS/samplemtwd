/**
 * FileName: product.apps.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.09
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';

export default class ProductApps extends TwViewController {
  private APPS_CODE = 'F01700';

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getBanners().subscribe(banners => {
      if (banners.code) {
        return this.error.render(res, {
          ...banners,
          svcInfo
        });
      }

      res.render('app/product.apps.html', { svcInfo, pageInfo, banners });
    });
  }

  private getBanners = () => {
    return this.apiService.request(API_CMD.BFF_10_0050, { idxCtgCd: this.APPS_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result;
    });
  }
}
