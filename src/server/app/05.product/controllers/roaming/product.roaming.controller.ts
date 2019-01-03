/**
 * FileName: product.roaming.controller.ts
 * Author: Juho Kim (jhkim@pineone.com)
 * Date: 2018.11.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { REDIS_BANNER_ADMIN } from '../../../../types/redis.type';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductRoaming extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( this.isLogin(svcInfo) ) {
      this.renderLogin(res, svcInfo, pageInfo);
    } else {
      this.renderLogout(res, svcInfo, pageInfo);
    }
  }

  private renderLogout(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getBanners(pageInfo),
      this.getSprateProds()
    ).subscribe(([banners, sprateProds]) => {

      console.log(banners);

      const error = {
        code: banners.code || sprateProds.code,
        msg: banners.msg || sprateProds.msg
      };

      if ( error.code ) {
        return this.error.render(res, { ...error, svcInfo });
      }

      res.render('roaming/product.roaming.html', {
        svcInfo,
        pageInfo,
        isLogin: this.isLogin(svcInfo),
        banners,
        sprateProds
      });
    });
  }

  private renderLogin(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getRoamingCount(),
      this.getBanners(pageInfo),
      this.getSprateProds()
    ).subscribe(([roamingCount, banners, sprateProds]) => {

      const error = {
        code: roamingCount.code || banners.code || sprateProds.code,
        msg: roamingCount.msg || banners.msg || sprateProds.msg
      };

      if ( error.code ) {
        return this.error.render(res, { ...error, svcInfo });
      }

      res.render('roaming/product.roaming.html', {
        svcInfo,
        pageInfo,
        isLogin: this.isLogin(svcInfo),
        roamingCount,
        banners,
        sprateProds
      });
    });
  }

  private isLogin(svcInfo: any): boolean {
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return false;
    }
    return true;
  }

  private getRoamingCount(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0055, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

  private getBanners(pageInfo): Observable<any> {
    return this.redisService.getData(REDIS_BANNER_ADMIN + pageInfo.menuId).map((resp) => {
      if ( resp.code !== API_CODE.REDIS_SUCCESS ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      resp.result.topBanners = resp.result.banners.filter(function (banner) {
        return banner.bnnrLocCd === 'T';
      });
      resp.result.centerBanners = resp.result.banners.filter(function (banner) {
        return banner.bnnrLocCd === 'C';
      });

      resp.result.topBanners.sort(function (a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });
      resp.result.centerBanners.sort(function (a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });

      return resp.result;
    });
  }

  private getSprateProds(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0123, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      resp.result.prodList.map(prod => {
        prod.basFeeInfo = FormatHelper.numberWithCommas(Number(prod.basFeeInfo));
      });

      return resp.result;
    });
  }
}
