/**
 * 모바일 요금제 > 사용량 변경 옵션 설정
 * FileName: product.mobileplan.setting.option.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.13
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PROD_TTAB_BASIC_DATA_PLUS } from '../../../../../types/bff.type';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanSettingOption extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005058', 'NA00005059', 'NA00005060', 'NA00005069', 'NA00005070', 'NA00005071'];

  /**
   * @param prodId
   * @param optionInfo
   * @private
   */
  private _convOptionInfo(prodId, optionInfo: any): any {
    return Object.assign(optionInfo, {
      basicDataPlus: PROD_TTAB_BASIC_DATA_PLUS[prodId]
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: '설정'
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0037, {}, {}, prodId)
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
