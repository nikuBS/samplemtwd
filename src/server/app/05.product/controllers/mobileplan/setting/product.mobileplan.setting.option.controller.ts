/**
 * 모바일 요금제 > 사용량 변경 옵션 설정
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-13
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PROD_TTAB_BASIC_DATA_PLUS } from '../../../../../types/bff.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSettingOption extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00005058', 'NA00005059', 'NA00005060', 'NA00005069', 'NA00005070', 'NA00005071'];

  /**
   * 설정 정보 데이터 변환
   * @param prodId - 상품코드
   * @param optionInfo - API 응답값
   */
  private _convOptionInfo(prodId, optionInfo: any): any {
    return Object.assign(optionInfo, {
      basicDataPlus: PROD_TTAB_BASIC_DATA_PLUS[prodId]
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

    this.apiService.request(API_CMD.BFF_10_0037, {}, {})
      .subscribe((optionInfo) => {
        if (optionInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: optionInfo.code,
            msg: optionInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.option.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          optionInfo: this._convOptionInfo(prodId, optionInfo.result)
        }));
      });
  }
}

export default ProductMobileplanSettingOption;
