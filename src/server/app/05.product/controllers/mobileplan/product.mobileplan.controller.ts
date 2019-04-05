/**
 * @file product.mobileplan.controller.ts
 * @author Jiyoung Jo
 * @since 2018.09.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT, TIME_UNIT, UNIT } from '../../../../types/string.type';
import { PRODUCT_CODE } from '../../../../types/bff.type';

export default class Product extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getProductGroups(),
      this.getRecommendedPlans(),
      this.getMyFilters(svcInfo && svcInfo.svcAttrCd.startsWith('M')),
      this.getRecommendedTags()
    ).subscribe(([groups, recommendedPlans, myFilters, recommendedTags]) => {
      const error = {
        code: groups.code || recommendedPlans.code || (myFilters && myFilters.code) || recommendedTags.code,
        msg: groups.msg || recommendedPlans.msg || (myFilters && myFilters.msg) || recommendedTags.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      const productData = { groups, myFilters, recommendedPlans, recommendedTags };
      res.render('mobileplan/product.mobileplan.html', { svcInfo, pageInfo, productData });
    });
  }

  private getProductGroups = () => {
    return this.apiService.request(API_CMD.BFF_10_0026, { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {
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
        grpProdList: resp.result.grpProdList.map(group => {
          return {
            ...group,
            prodGrpFlagImgUrl: group.prodGrpFlagImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpFlagImgUrl),
            prodGrpIconImgUrl: group.prodGrpIconImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpIconImgUrl),
            prodList: group.prodList.map(plan => {
              return {
                ...plan,
                basFeeInfo: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
                displayInfo: this.getDisplayData(plan.basOfrGbDataQtyCtt, plan.basOfrMbDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
              };
            })
          };
        })
      };
    });
  }

  private getDisplayData = (gbData?: string, mbData?: string, voice?: string, char?: string) => {
    const info: { icon?: string; value?: string; unit?: string } = {};

    if (gbData && gbData !== '-') {
      const nData = Number(gbData);
      info.icon = 'type';
      info.value = gbData;

      if (!isNaN(nData)) {
        info.unit = DATA_UNIT.GB;
      }
    } else if (mbData && mbData !== '-') {
      const nData = Number(mbData);
      info.icon = 'type';
      info.value = mbData;

      if (!isNaN(nData)) {
        info.unit = DATA_UNIT.MB;
      }
    } else if (voice && voice !== '-') {
      info.icon = 'money-type';
      info.value = voice;

      if (!isNaN(Number(voice))) {
        info.unit = TIME_UNIT.MINUTE;
      }
    } else if (char && char !== '-') {
      info.icon = 'sms';
      info.value = char;

      if (!isNaN(Number(char))) {
        info.unit = UNIT.SMS;
      }
    } else {
      return null;
    }

    return info;
  }

  private getMyFilters = isLogin => {
    if (isLogin) {
      return this.apiService.request(API_CMD.BFF_10_0025, { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {
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

  private getRecommendedPlans = () => {
    return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {
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
        prodList: resp.result.prodList.map(plan => {
          return {
            ...plan,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
            displayInfo: this.getDisplayData(plan.basOfrGbDataQtyCtt, plan.basOfrMbDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
          };
        })
      };
    });
  }

  private getRecommendedTags = () => {
    return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {
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
