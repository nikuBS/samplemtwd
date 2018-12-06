/**
 * FileName: product.mobileplan.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import BrowserHelper from '../../../../utils/browser.helper';
import ProductHelper from '../../../../utils/product.helper';
import { DATA_UNIT, TIME_UNIT, UNIT } from '../../../../types/string.type';

export default class Product extends TwViewController {
  private PLAN_CODE = 'F01100';

  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const uri = req.url.replace('/mobileplan/', '');
    if (uri === 'club-t') {
      res.render('mobileplan/product.mobileplan.club-t.html', { svcInfo });
    } else if (uri === 'campuszone') {
      res.render('mobileplan/product.mobileplan.campuszone.html', { svcInfo });
    } else if (uri === 'concierge') {
      res.render('mobileplan/product.mobileplan.concierge.html', { svcInfo });
    } else {
      Observable.combineLatest(
        this.getPromotionBanners(),
        this.getProductGroups(),
        this.getRecommendedPlans(),
        this.getMyFilters(!!svcInfo),
        this.getRecommendedTags()
      ).subscribe(([banners, groups, recommendedPlans, myFilters, recommendedTags]) => {
        const error = {
          code: banners.code || groups.code || recommendedPlans.code || (myFilters && myFilters.code) || recommendedTags.code,
          msg: banners.msg || groups.msg || recommendedPlans.msg || (myFilters && myFilters.msg) || recommendedTags.msg
        };

        if (error.code) {
          return this.error.render(res, { ...error, svcInfo });
        }

        const productData = { banners, groups, myFilters, recommendedPlans, recommendedTags };
        res.render('mobileplan/product.mobileplan.html', { svcInfo, pageInfo, productData });
      });
    }
  }

  private getPromotionBanners = () => {
    return this.apiService.request(API_CMD.BFF_10_0024, { idxCtgCd: this.PLAN_CODE }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

  private getProductGroups = () => {
    return this.apiService.request(API_CMD.BFF_10_0026, { idxCtgCd: this.PLAN_CODE }).map(resp => {
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
            prodList: group.prodList.map(plan => {
              return {
                ...plan,
                basFeeInfo: ProductHelper.convProductBasfeeInfo(plan.basFeeInfo),
                displayInfo: this.getDisplayData(plan.basOfrDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
              };
            })
          };
        })
      };
    });
  }

  private getDisplayData = (data?: string, voice?: string, char?: string) => {
    const info: { icon?: string; value?: string; unit?: string } = {};

    if (data && data !== '-') {
      const nData = Number(data);
      info.icon = 'type';
      info.value = data;

      if (!isNaN(nData)) {
        info.unit = nData > 1000 ? DATA_UNIT.GB : DATA_UNIT.MB;
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
      return this.apiService.request(API_CMD.BFF_10_0025, { idxCtgCd: this.PLAN_CODE }).map(resp => {
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
    return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: this.PLAN_CODE }).map(resp => {
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
            displayInfo: this.getDisplayData(plan.basOfrDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
          };
        })
      };
    });
  }

  private getRecommendedTags = () => {
    return this.apiService.request(API_CMD.BFF_10_0029, { idxCtgCd: this.PLAN_CODE }).map(resp => {
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
