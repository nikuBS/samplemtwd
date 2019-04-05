/**
 * 모바일 요금제 > 데이터 상한금액 설정
 * FileName: product.mobileplan.setting.ting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanSettingTing extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00003160', 'NA00003161', 'NA00002591', 'NA00002592', 'NA00002593', 'NA00002594', 'NA00003011',
    'NA00003048', 'NA00003146', 'NA00003405', 'NA00003406', 'NA00003407', 'NA00003408'];

  /**
   * @param tingInfo
   * @private
   */
  private _convertTingInfo(tingInfo: any): any {
    return Object.assign(tingInfo, {
      beforeLmtGrCd: FormatHelper.isEmpty(tingInfo.beforeLmtGrCd) ? 'A' : tingInfo.beforeLmtGrCd
    });
  }

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

    this.apiService.request(API_CMD.BFF_10_0040, {}, {})
      .subscribe((tingInfo) => {
        if (tingInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: tingInfo.code,
            msg: tingInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.ting.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          tingInfo: this._convertTingInfo(tingInfo.result)
        }));
      });
  }
}

export default ProductMobileplanSettingTing;
