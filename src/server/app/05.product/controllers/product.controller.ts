/**
 * FileName: product.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE } from '../../../types/api-command.type';
import {
  PRODUCT_PROMOTION_BANNERS,
  PRODUCT_PLAN_GROUPS,
  PRODUCT_MY_FILTERS,
  PRODUCT_RECOMMENDED_PLANS,
  PRODUCT_RECOMMENDED_TAGS
} from '../../../mock/server/product.submain.mock';
import FormatHelper from '../../../utils/format.helper';

export default class Product extends TwViewController {
  private PLAN_CODE = 'F01100';

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const productData = {
      banners: this.getPromotionBanners(),
      groups: this.getProductGroups(),
      myFilters: this.getMyFilters(),
      recommendedPlans: this.getRecommendedPlans(),
      recommendedTags: this.getRecommendedTags()
    };

    res.render('product.html', { svcInfo, productData });
  }

  private getPromotionBanners = () => {
    // return this.apiService.request(API_CMD.BFF_10_0024, { idxCtgCd: this.PLAN_CODE }).map(resp => {});
    const resp = PRODUCT_PROMOTION_BANNERS;
    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }

  private getProductGroups = () => {
    // return this.apiService.request(API_CMD.BFF_10_0026, { idxCtgCd: this.PLAN_CODE }).map(resp => {});
    const resp = PRODUCT_PLAN_GROUPS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return {
      ...resp.result,
      grpProdList: resp.result.grpProdList.map(group => {
        return {
          ...group,
          prodList: group.prodList.map(plan => {
            return {
              ...plan,
              basFeeInfo: FormatHelper.addComma(plan.basFeeInfo)
            };
          })
        };
      })
    };
  }

  private getMyFilters = () => {
    // return this.apiService.request(API_CMD.BFF_10_0025, { idxCtgCd: this.PLAN_CODE }).map(resp => {});
    const resp = PRODUCT_MY_FILTERS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }

  private getRecommendedPlans = () => {
    // return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: this.PLAN_CODE }).map(resp => {});
    const resp = PRODUCT_RECOMMENDED_PLANS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return {
      ...resp.result,
      prodList: resp.result.prodList.map(plan => {
        return {
          ...plan,
          basFeeInfo: FormatHelper.addComma(plan.basFeeInfo)
        };
      })
    };
  }

  private getRecommendedTags = () => {
    // return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: this.PLAN_CODE }).map(resp => {});

    const resp = PRODUCT_RECOMMENDED_TAGS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }
}
