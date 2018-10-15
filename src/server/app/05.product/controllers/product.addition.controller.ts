/**
 * FileName: product.addition.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.08
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

export default class ProductAddition extends TwViewController {
  private ADDITION_CODE = 'F01200';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _layerType: string) {
    Observable.combineLatest(
      this.getMyAdditions(),
      this.getPromotionBanners(),
      this.getBestAdditions(),
      this.getAdditionBanners(),
      this.getRecommendedAdditions(),
      this.getRecommendedTags()
    ).subscribe(([myAdditions, banners, bestAdditions, additionBanners, recommendedAdditions, recommendedTags]) => {
      const error = {
        code: myAdditions.code || banners.code || bestAdditions.code || additionBanners.code || recommendedAdditions.code || recommendedTags.code,
        msg: myAdditions.msg || banners.msg || bestAdditions.msg || additionBanners.msg || recommendedAdditions.msg || recommendedTags.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, svcInfo });
      }

      const productData = {
        myAdditions,
        banners,
        bestAdditions,
        additionBanners,
        recommendedAdditions,
        recommendedTags
      };
      res.render('product.addition.html', { svcInfo, productData });
    });
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
            basFeeInfo: FormatHelper.getFeeContents(addition.basFeeInfo)
          };
        })
      };
    });
  }

  private getAdditionBanners = () => {
    return this.apiService.request(API_CMD.BFF_10_0030, { idxCtgCd: this.ADDITION_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return resp.result.bnnrList;
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
            basFeeInfo: FormatHelper.getFeeContents(addition.basFeeInfo)
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
