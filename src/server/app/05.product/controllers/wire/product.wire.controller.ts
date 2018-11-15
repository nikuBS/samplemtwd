/**
 * FileName: product.wire.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

export default class ProductWire extends TwViewController {
  private WIRE_CODE = 'F01300';

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const uri = req.url.replace('/wireplan/', '');
    if (uri === 'service-area') {
      res.render('wire/product.wire.service-area.html', { svcInfo, pageInfo });
    } else if (uri === 'portability') {
      res.render('wire/product.wire.portability.html', { svcInfo, pageInfo });
    } else {
      Observable.combineLatest(this.getMyWireInfo(svcInfo), this.getBanners()).subscribe(([myWire, banners]) => {
        const error = {
          code: (myWire && myWire.code) || banners.code,
          msg: (myWire && myWire.msg) || banners.msg
        };

        if (error.code) {
          return this.error.render(res, {
            ...error,
            svcInfo
          });
        }

        res.render('wire/product.wire.html', { svcInfo, pageInfo, myWire, banners });
      });
    }
  }

  private getMyWireInfo = svcInfo => {
    if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
      return this.apiService.request(API_CMD.BFF_05_0181, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return resp;
        }
        return resp.result;
      });
    }

    return of(undefined);
  }

  private getBanners = () => {
    return this.apiService.request(API_CMD.BFF_10_0050, { idxCtgCd: this.WIRE_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        top: (resp.result || []).filter(banner => {
          return banner.bnnrLocCd === 'T';
        }),
        center: (resp.result || []).filter(banner => {
          return banner.bnnrLocCd === 'C';
        })
      };
    });
  }
}
