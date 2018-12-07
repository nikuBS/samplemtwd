/**
 * FileName: product.mobileplan-add.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductAddition extends TwViewController {
  private ADDITION_CODE = 'F01200';

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getMyAdditions(!!svcInfo),
      this.getBestAdditions(),
      this.getRecommendedAdditions(),
      this.getRecommendedTags()
    ).subscribe(([myAdditions, bestAdditions, recommendedAdditions, recommendedTags]) => {
      const error = {
        code: (myAdditions && myAdditions.code) || bestAdditions.code || recommendedAdditions.code || recommendedTags.code,
        msg: (myAdditions && myAdditions.msg) || bestAdditions.msg || recommendedAdditions.msg || recommendedTags.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, svcInfo });
      }

      const productData = {
        myAdditions,
        bestAdditions,
        recommendedAdditions,
        recommendedTags
      };
      res.render('mobileplan-add/product.mobileplan-add.html', { svcInfo, productData, pageInfo });
    });
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

  private getPromotionBanners = () => {
    return this.apiService.request(API_CMD.BFF_10_0024, { idxCtgCd: this.ADDITION_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

  private getBestAdditions = () => {
    return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: this.ADDITION_CODE }).map(resp => {
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
        prodList: (resp.result.prodList || []).map(addition => {
          return {
            ...addition,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(addition.basFeeInfo)
          };
        })
      };
    });
  }

  private getRecommendedAdditions = () => {
    return this.apiService.request(API_CMD.BFF_10_0028, { idxCtgCd: this.ADDITION_CODE }).map(resp => {
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
        prodList: (resp.result.prodList || []).map(addition => {
          return {
            ...addition,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(addition.basFeeInfo)
          };
        })
      };
    });
  }

  private getRecommendedTags = () => {
    return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: this.ADDITION_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }
}
