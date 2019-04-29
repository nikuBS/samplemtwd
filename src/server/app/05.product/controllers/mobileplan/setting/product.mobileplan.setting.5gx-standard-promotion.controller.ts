/**
 * 모바일 요금제 > 설정 > 5Gx 스탠다드 프로모션
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-29
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSetting5gxStandardPromotion extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006403', 'NA00006404'];

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
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

    this.apiService.request(API_CMD.BFF_10_0177, {}, {}, [prodId])
      .subscribe((settingInfo) => {
        if (settingInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: settingInfo.code,
            msg: settingInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.5gx-standard-promotion.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          settingInfo: settingInfo.result
        }));
      });
  }
}

export default ProductMobileplanSetting5gxStandardPromotion;
