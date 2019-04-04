/**
 * 모바일 요금제 > Data 인피니티 설정
 * @file product.mobileplan.setting.tplan.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.13
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanSettingTplan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005959'];

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

    this.apiService.request(API_CMD.BFF_10_0013, {}, {}, [prodId])
      .subscribe((benefitInfo) => {
        if (benefitInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: benefitInfo.code,
            msg: benefitInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.tplan.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          benefitInfo: benefitInfo.result
        }));
      });
  }
}

export default ProductMobileplanSettingTplan;
