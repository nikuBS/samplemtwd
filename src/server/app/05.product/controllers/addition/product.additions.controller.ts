/**
 * FileName: product.additions.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

export default class ProductAdditions extends TwViewController {
  private ADDITION_CODE = 'F01200';

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const params = {
      idxCtgCd: this.ADDITION_CODE,
      ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
      ...(req.query.tag ? { searchTagId: req.query.tag } : {})
    };

    if (svcInfo) {
      Observable.combineLatest(this.getMyAdditions(), this.getAddtions(params)).subscribe(([myAdditions, additions]) => {
        const error = {
          code: myAdditions.code || additions.code,
          msg: myAdditions.msg || additions.msg
        };

        if (error.code) {
          return this.error.render(res, { ...error, svcInfo });
        }

        res.render('addition/product.additions.html', { svcInfo, additionData: { myAdditions, additions }, params, pageInfo });
      });
    } else {
      this.getAddtions(params).subscribe(additions => {
        res.render('addition/product.additions.html', { svcInfo, additionData: { additions }, params, pageInfo });
      });
    }
  }

  private getMyAdditions = () => {
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

  private getAddtions = params => {
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
            basFeeAmt: FormatHelper.getFeeContents(addition.basFeeAmt)
          };
        })
      };
    });
  }
}
