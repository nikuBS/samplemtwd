/**
 * FileName: product.addition.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import {
  PRODUCT_MY_ADDITIONAL,
  PRODUCT_PROMOTION_BANNERS,
  PRODUCT_MY_FILTERS,
  PRODUCT_BEST_ADDITIONS,
  PRODUCT_RECOMMENDED_ADDITIONS,
  PRODUCT_ADDITIONAL_BANNERS,
  PRODUCT_RECOMMENDED_TAGS
} from '../../../mock/server/product.submain.mock';
import FormatHelper from '../../../utils/format.helper';

export default class ProductAddition extends TwViewController {
  private ADDITION_CODE = 'F01200';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _layerType: string) {
    const productData = {
      myAdditions: this.getMyAdditions(),
      banners: this.getPromotionBanners(),
      bestAdditions: this.getBestAdditions(),
      additionBanners: this.getAdditionBanners(),
      recommendedAdditions: this.getRecommendedAdditions(),
      recommendedTags: this.getRecommendedTags()
    };

    res.render('product.addition.html', { svcInfo, productData });
  }

  private getMyAdditions = () => {
    // this.apiService.request(API_CMD.BFF_05_0166, {}).map(resp => {});

    const resp = PRODUCT_MY_ADDITIONAL;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result.addProductJoinsInfo;
  }

  private getPromotionBanners = () => {
    // return this.apiService.request(API_CMD.BFF_10_0024, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});
    const resp = PRODUCT_PROMOTION_BANNERS;
    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }

  private getMyFilters = () => {
    // return this.apiService.request(API_CMD.BFF_10_0025, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});
    const resp = PRODUCT_MY_FILTERS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }

  private getBestAdditions = () => {
    // return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});
    const resp = PRODUCT_BEST_ADDITIONS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return {
      ...resp.result,
      prodList: resp.result.prodList.map(addition => {
        return {
          ...addition,
          basFeeInfo: FormatHelper.getFeeContents(addition.basFeeInfo)
        };
      })
    };
  }

  private getAdditionBanners = () => {
    // return this.apiService.request(API_CMD.BFF_10_0028, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});
    const resp = PRODUCT_ADDITIONAL_BANNERS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result.bnnrList;
  }

  private getRecommendedAdditions = () => {
    // return this.apiService.request(API_CMD.BFF_10_0028, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});
    const resp = PRODUCT_RECOMMENDED_ADDITIONS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return {
      ...resp.result,
      prodList: resp.result.prodList.map(addition => {
        return {
          ...addition,
          basFeeInfo: FormatHelper.getFeeContents(addition.basFeeInfo)
        };
      })
    };
  }

  private getRecommendedTags = () => {
    // return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: this.ADDITIONAL_CODE }).map(resp => {});

    const resp = PRODUCT_RECOMMENDED_TAGS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result;
  }
}
