/**
 * FileName: product.mobileplan-add.list.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.10.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { PRODUCT_CODE } from '../../../../types/bff.type';

export default class ProductAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const params = {
      idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.order ? { searchOrder: req.query.order } : {}),
      ...(req.query.tag ? { searchTagId: req.query.tag } : {})
    };

    Observable.combineLatest(this.getMyAdditions(svcInfo && svcInfo.svcAttrCd.startsWith('M')), this.getAdditions(params)).subscribe(
      ([myAdditions, additions]) => {
        const error = {
          code: (myAdditions && myAdditions.code) || additions.code,
          msg: (myAdditions && myAdditions.msg) || additions.msg
        };

        if (error.code) {
          return this.error.render(res, { ...error, pageInfo, svcInfo });
        }

        res.render('mobileplan-add/product.mobileplan-add.list.html', { svcInfo, additionData: { myAdditions, additions }, params, pageInfo });
      }
    );
  }

  private getMyAdditions = isLogin => {
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

  private getAdditions = params => {
    return this.apiService.request(API_CMD.BFF_10_0031, params).map(resp => {
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
        products: resp.result.products.map(addition => {
          return {
            ...addition,
            basFeeAmt: ProductHelper.convProductBasfeeInfo(addition.basFeeAmt),
            basOfrDataQtyCtt: this.isEmptyAmount(addition.basOfrDataQtyCtt)
              ? this.isEmptyAmount(addition.basOfrMbDataQtyCtt)
                ? null
                : ProductHelper.convProductBasOfrDataQtyCtt(addition.basOfrMbDataQtyCtt)
              : ProductHelper.convProductBasOfrDataQtyCtt(addition.basOfrDataQtyCtt, DATA_UNIT.GB),
            basOfrVcallTmsCtt: this.isEmptyAmount(addition.basOfrVcallTmsCtt)
              ? null
              : ProductHelper.convProductBasOfrVcallTmsCtt(addition.basOfrVcallTmsCtt, false),
            basOfrCharCntCtt: this.isEmptyAmount(addition.basOfrCharCntCtt)
              ? null
              : ProductHelper.convProductBasOfrCharCntCtt(addition.basOfrCharCntCtt)
          };
        })
      };
    });
  }

  private isEmptyAmount(value: string) {
    return !value || value === '' || value === '-';
  }
}
