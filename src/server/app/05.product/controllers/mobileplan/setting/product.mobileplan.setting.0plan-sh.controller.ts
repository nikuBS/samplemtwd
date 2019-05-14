/**
 * 모바일 요금제 > 0플랜 슈퍼히어로 설정
 * @author junho kwon (yamanin1@partner.sk.com)
 * @since 2019-5-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSetting0planSh extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006401']; //NA00006157 0플랜 라지

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
      .subscribe((ZeroPlanInfo) => {
        if (ZeroPlanInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: ZeroPlanInfo.code,
            msg: ZeroPlanInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.0plan-sh.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          ZeroPlanInfo: ZeroPlanInfo.result
        }));
      });
  }
}

export default ProductMobileplanSetting0planSh;
