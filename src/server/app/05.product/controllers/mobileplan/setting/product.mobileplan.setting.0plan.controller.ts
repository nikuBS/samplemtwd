/**
 * 모바일 요금제 > 0플랜 라지 설정
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSetting0plan extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006157'];

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

    this.apiService.request(API_CMD.BFF_10_0034, {}, {})
      .subscribe((ZeroPlanInfo) => {
        if (ZeroPlanInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: ZeroPlanInfo.code,
            msg: ZeroPlanInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.0plan.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          ZeroPlanInfo: ZeroPlanInfo.result
        }));
      });
  }
}

export default ProductMobileplanSetting0plan;
