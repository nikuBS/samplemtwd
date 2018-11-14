/**
 * 모바일 부가서비스 > 시그니처워치
 * FileName: product.setting.signature-line.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';

class ProductSettingSignatureLine extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param combineLIneInfo
   * @private
   */
  private _convCombineLineInfo(combineLIneInfo: any): any {
    return Object.assign(combineLIneInfo, {
      svcProdGrpId: combineLIneInfo.combinationLineList[0].svcMgmtNum,
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
        svcNumMask: FormatHelper.conTelFormatWithDash(item.asgnNumMask)
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: '설정'
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0021, {}, {}, prodId)
      .subscribe((combineLineInfo) => {
        if (combineLineInfo.code !== API_CODE.CODE_00 || combineLineInfo.result.combinationLineList.length < 1) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: combineLineInfo.code,
            msg: combineLineInfo.msg
          }));
        }

        res.render('setting/product.setting.signature-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          combineLineInfo: this._convCombineLineInfo(combineLineInfo.result),
          isApp: BrowserHelper.isApp(req)
        }));
      });
  }
}

export default ProductSettingSignatureLine;
