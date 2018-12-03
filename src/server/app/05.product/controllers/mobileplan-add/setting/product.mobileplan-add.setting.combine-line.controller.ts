/**
 * 모바일 부가서비스 > 내폰끼리 결합 설정
 * FileName: product.mobileplan-add.setting.combine-line.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.13
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import FormatHelper from '../../../../../utils/format.helper';

class ProductMobileplanAddSettingCombineLine extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00004778'];

  /**
   * @param combineLIneInfo
   * @private
   */
  private _convCombineLineInfo(combineLIneInfo: any): any {
    return Object.assign(combineLIneInfo, {
      svcProdGrpId: combineLIneInfo.combinationLineList[0].svcProdGrpId,
      combinationLineList: this._convertSvcNumMask(combineLIneInfo.combinationLineList)
    });
  }

  /**
   * @param combinationLineList
   * @private
   */
  private _convertSvcNumMask(combinationLineList): any {
    return combinationLineList.map((item) => {
      return Object.assign(item, {
        svcNumMask: FormatHelper.conTelFormatWithDash(item.svcNumMask)
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.SETTING
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0021, {}, {}, prodId)
      .subscribe((combineLineInfo) => {
        if (combineLineInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: combineLineInfo.code,
            msg: combineLineInfo.msg
          }));
        }

        res.render('mobileplan-add/setting/product.mobileplan-add.setting.combine-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          combineLineInfo: this._convCombineLineInfo(combineLineInfo.result),
          isApp: BrowserHelper.isApp(req)
        }));
      });
  }
}

export default ProductMobileplanAddSettingCombineLine;
