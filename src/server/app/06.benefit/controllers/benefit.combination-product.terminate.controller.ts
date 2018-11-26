/**
 * 상품 해지 - T+B결합상품
 * FileName: benefit.combination-product.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.23
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../types/string.type';
import FormatHelper from '../../../utils/format.helper';

class BenefitCombinationProductTerminate extends TwViewController {
  constructor() {
    super();
  }

  private _convertTermInfo(termInfo: any): any {
    return {};
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo
      });
    }

    this.apiService.request(API_CMD.BFF_10_0114, {}, {}, prodId)
      .subscribe((joinTermInfo) => {
        if (joinTermInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg
          }));
        }

        res.render('benefit.combination-product.terminate.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          joinTermInfo: this._convertTermInfo(joinTermInfo.result)
        }));
      });
  }
}

export default BenefitCombinationProductTerminate;
