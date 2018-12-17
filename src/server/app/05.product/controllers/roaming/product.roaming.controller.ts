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
import BFF_10_0089_mock from '../../../../mock/server/product.BFF_10_0089.mock';
import EnvHelper from '../../../../utils/env.helper';

export default class ProductRoaming extends TwViewController {
  constructor() {
    super();
  }

  // (SB) sprint 11 차수에서 submain 하드코딩
  // render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
  //   Observable.combineLatest(
  //     this.getRoamingCount(),
  //     this.getPromBannerList(),
  //     this.getAlpaList(),
  //     this.getBannerList()
  //   ).subscribe(([roamingCount, promBannerList, alpaList, bannerList]) => {
  //
  //     const error = {
  //       code:　roamingCount.code || promBannerList.code || alpaList.code || bannerList.code,
  //       msg:　roamingCount.msg || promBannerList.msg || alpaList.msg || bannerList.msg
  //     };
  //
  //     if (error.code) {
  //       return this.error.render(res, { ...error, svcInfo });
  //     }
  //
  //     res.render('roaming/product.roaming.html', { svcInfo, roamingCount, promBannerList, alpaList, bannerList });
  //   });
  // }

  // (SB) sprint 11 차수에서 submain 하드코딩
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (this.isLogin(svcInfo)) {
      Observable.combineLatest(
        this.getRoamingCount(),
        this.getAlpaList()
      ).subscribe(([roamingCount, alpaList]) => {

        const error = {
          code: roamingCount.code || alpaList.code,
          msg: roamingCount.msg || alpaList.msg
        };

        if ( error.code ) {
          return this.error.render(res, { ...error, svcInfo });
        }

        res.render('roaming/product.roaming.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), roamingCount, alpaList });
      });
    } else {
      Observable.combineLatest(
        this.getAlpaList()
      ).subscribe(([alpaList]) => {

        const error = {
          code: alpaList.code,
          msg: alpaList.msg
        };

        if ( error.code ) {
          return this.error.render(res, { ...error, svcInfo });
        }

        res.render('roaming/product.roaming.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), alpaList });
      });
    }
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
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

  private getPromBannerList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0088, {'bnnrExpsAreaCd' : '_banner_2007_F', 'svcDvcClCd' : 'M'}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

  private getAlpaList(): Observable<any> {
    return Observable.of(BFF_10_0089_mock)
    // return this.apiService.request(API_CMD.BFF_10_0089, {'bnnrExpsAreaCd' : '_alpha_2002_F'})
    .map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return resp.result.map(alpa => {
          return {
            ...alpa,
            actvnAreaHtmlCtt: alpa.actvnAreaHtmlCtt.replace(/src=([\"\'])/gi, 'src=$1' + EnvHelper.getEnvironment('CDN'))
          };
      });
    });
  }

  private getBannerList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0090, {'svcDvcClCd' : 'M'}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }
}
