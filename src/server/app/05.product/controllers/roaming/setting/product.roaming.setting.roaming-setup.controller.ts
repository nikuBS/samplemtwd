/**
 * 로밍 시작일 종료일 설정 case 설정 변경
 * @file product.roaming.setting.roaming-setup.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import { ROAMING_PRODUCT_CUSTOMIZE_DATA } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';


class ProductRoamingSettingRoamingSetup extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {


    const prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.SETTING
      });
    }

    // 상품 별 가이드 수정사항 확인
    const customGuide = FormatHelper.isEmpty(ROAMING_PRODUCT_CUSTOMIZE_DATA[prodId]) ? {} : ROAMING_PRODUCT_CUSTOMIZE_DATA[prodId];
    const isCustomGuidedProd = !FormatHelper.isEmpty(customGuide);
    
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId])
    ).subscribe(([ prodTypeInfo, prodBffInfo ]) => {

      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodBffInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.SETTING,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodBffInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodBffInfo.msg
        });
      }

      res.render('roaming/setting/product.roaming.setting.roaming-setup.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        pageInfo : pageInfo,
        isCustomGuidedProd : isCustomGuidedProd,
        customGuide : customGuide
      });
    });


  }
}

export default ProductRoamingSettingRoamingSetup;

