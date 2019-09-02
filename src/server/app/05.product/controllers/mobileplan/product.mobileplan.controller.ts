/**
 * @file 요금제 < 상품
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

/**
 * @class
 * @desc 상품 > 모바일 요금제 
 */
export default class Product extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    var isLogin = svcInfo && svcInfo.svcAttrCd.startsWith('M');

    Observable.combineLatest(
      this._getProductGroups(),
      this.getRecommendedPlans(),
      this._getMyFilters(isLogin),
      this.getRecommendedTags(),
      this.getIsAdRcvAgreeBannerShown(isLogin, svcInfo)
    ).subscribe(([groups, recommendedPlans, myFilters, recommendedTags, isAdRcvAgreeBannerShown]) => {
      const error = {
        code: groups.code || recommendedPlans.code || (myFilters && myFilters.code) || recommendedTags.code,
        msg: groups.msg || recommendedPlans.msg || (myFilters && myFilters.msg) || recommendedTags.msg
      };

      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      const productData = { groups, myFilters, recommendedPlans, recommendedTags };
      res.render('mobileplan/product.mobileplan.html', { svcInfo, pageInfo, productData, isLogin, isAdRcvAgreeBannerShown });
    });
  }

  /**
   * @desc 많이 찾는 요금제 요청
   * @private
   */
  private _getProductGroups = () => {
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
                displayInfo: this._getDisplayData(plan.basOfrGbDataQtyCtt, plan.basOfrMbDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
              };
            })
          };
        })
      };
    });
  }

  /**
   * @desc BFF 데이터 음성, 데이터, 문자 데이터 가공
   * @private
   */
  private _getDisplayData = (gbData?: string, mbData?: string, voice?: string, char?: string) => {
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

  /**
   * @desc 내가 가입한 요금제의 필터 요청(유사한 요금제를 찾아보세요!)
   * @param {boolean} isLogin 로그인 여부
   * @private
   */
  private _getMyFilters = isLogin => {
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

  /**
   * @desc 추천 요금제 요청
   * @private
   */
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
            displayInfo: this._getDisplayData(plan.basOfrGbDataQtyCtt, plan.basOfrMbDataQtyCtt, plan.basOfrVcallTmsCtt, plan.basOfrCharCntCtt)
          };
        })
      };
    });
  }

  /**
   * @desc 추천 태그
   * @private
   */
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

  /**
   * 광고성 정보 수신동의 배너 노출여부
   * @return {boolean}
   */
  private getIsAdRcvAgreeBannerShown(isLogin, svcInfo): Observable<any> {
    if ( !isLogin ) {
      return Observable.of(false);
    }

    if (FormatHelper.isEmpty(svcInfo) || FormatHelper.isEmpty(svcInfo.loginType) || svcInfo.loginType != 'T') {
      return Observable.of(false);
    }

    return this.apiService.request(API_CMD.BFF_03_0021, null).map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return false;
      }
      return resp.result.twdAdRcvAgreeYn !== 'Y';
    });
  }
}
