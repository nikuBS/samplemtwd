/**
 * FileName: product.wires.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { of } from 'rxjs/observable/of';
import { PRODUCT_WIRE_CATEGORIES } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

export default class ProductWires extends TwViewController {
  private WIRE_CODE = 'F01300';
  private CATEGORIES = {
    internet: 'F01321',
    phone: 'F01322',
    tv: 'F01323'
  };
  private PLAN_CODE = 'F01331';
  private ADDITION_CODE = 'F01332';
  private MAX_SEARCH_COUNT = 100;

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const page = req.url.substring(1);

    const params = { idxCtgCd: this.WIRE_CODE, searchCount: this.MAX_SEARCH_COUNT };

    Observable.combineLatest(
      this.getMyWireInfo(svcInfo),
      this.getList({ ...params, searchFltIds: this.CATEGORIES[page] + ',' + this.PLAN_CODE }),
      this.getList({ ...params, searchFltIds: this.CATEGORIES[page] + ',' + this.ADDITION_CODE })
    ).subscribe(([myWire, plan, addition]) => {
      const error = {
        code: (myWire && myWire.code) || plan.code || addition.code,
        msg: (myWire && myWire.msg) || plan.msg || addition.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          svcInfo
        });
      }

      res.render('wire/product.wires.html', { svcInfo, pageInfo, myWire, page: PRODUCT_WIRE_CATEGORIES[page], plan, addition });
    });
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
            basFeeAmt: FormatHelper.getFeeContents(product.basFeeAmt)
          };
        })
      };
    });
  }
}
