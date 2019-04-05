/**
 * 모바일 요금제 > 0플랜 스몰/미디엄 설정
 * @file product.mobileplan.setting.0plan-sm.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.01.10
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanSetting0planSm extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00006155', 'NA00006156'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.SETTING
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0169, {}, {})
      .subscribe((ZeroPlanInfo) => {
        if (ZeroPlanInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: ZeroPlanInfo.code,
            msg: ZeroPlanInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.0plan-sm.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          ZeroPlanInfo: ZeroPlanInfo.result
        }));
      });
  }
}

export default ProductMobileplanSetting0planSm;
