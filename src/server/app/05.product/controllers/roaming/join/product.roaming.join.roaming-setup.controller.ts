/**
 * 로밍 상품 가입 시작일, 종료일 설정
 * @file product.roaming.setting.roaming-setup.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.11.28
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import { ROAMING_PRODUCT_CUSTOMIZE_DATA } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';


class ProductRoamingJoinRoamingSetup extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;
    const promotionProdIdArr = ['NA00005632', 'NA00005634', 'NA00005635', 'NA00006826'];  //프로모션 상품 id
    const isPromotion = promotionProdIdArr.indexOf(prodId) > -1;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    // 상품 별 가이드 수정사항 확인
    const customGuide = FormatHelper.isEmpty(ROAMING_PRODUCT_CUSTOMIZE_DATA[prodId]) ? {} : ROAMING_PRODUCT_CUSTOMIZE_DATA[prodId];
    const isCustomGuidedProd = !FormatHelper.isEmpty(customGuide);

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId])
    ).subscribe(([ preCheckInfo, prodTypeInfo, prodApiInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, prodTypeInfo, prodApiInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck : true
        });
      }

      res.render('roaming/join/product.roaming.join.roaming-setup.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodApiInfo : prodApiInfo.result,
        prodId : prodId,
        pageInfo : pageInfo,
        isPromotion : isPromotion,
        isCustomGuidedProd : isCustomGuidedProd,
        customGuide : customGuide
      });
    });


  }
}

export default ProductRoamingJoinRoamingSetup;

