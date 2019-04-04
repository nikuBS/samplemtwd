/**
 * @file product.wires.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { of } from 'rxjs/observable/of';
import { PRODUCT_WIRE_CATEGORIES } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import { PRODUCT_CODE, PRODUCT_WIRE_PLAN_CATEGORIES as CATEGORIES } from '../../../../types/bff.type';

const MAX_SEARCH_COUNT = 100;

export default class ProductWires extends TwViewController {
  constructor() {
    super();
  }


  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const page = req.url.replace('/wireplan/', '').toUpperCase();
    const params = { idxCtgCd: PRODUCT_CODE.WIRE_PLAN, searchCount: MAX_SEARCH_COUNT };

    Observable.combineLatest(
      this.getMyWireInfo(svcInfo),
      this.getList({ ...params, searchFltIds: CATEGORIES[page] + ',' + PRODUCT_CODE.PLAN }),
      this.getList({ ...params, searchFltIds: CATEGORIES[page] + ',' + PRODUCT_CODE.ADDITION })
    ).subscribe(([myWire, plan, additions]) => {
      const error = {
        code: (myWire && myWire.code) || plan.code || additions.code,
        msg: (myWire && myWire.msg) || plan.msg || additions.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          pageInfo,
          svcInfo
        });
      }

      res.render('wireplan/product.wireplan.list.html', { svcInfo, pageInfo, myWire, page: PRODUCT_WIRE_CATEGORIES[page], plan, additions });
    });
  }

  private getMyWireInfo = svcInfo => {
    if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
      return this.apiService.request(API_CMD.BFF_05_0179, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return resp;
        }
        return {
          prodNm: svcInfo.prodNm,
          count: Number(resp.result.additionCount)
        };
      });
    }

    return of(undefined);
  };

  private getList = params => {
    return this.apiService.request(API_CMD.BFF_10_0031, params).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        ...resp.result,
        products: (resp.result.products || []).map(product => {
          return {
            ...product,
            basFeeAmt: FormatHelper.getFeeContents(product.basFeeAmt),
            rgstImg: product.rgstImg && ProductHelper.getImageUrlWithCdn(product.rgstImg)
          };
        })
      };
    });
  }
}
