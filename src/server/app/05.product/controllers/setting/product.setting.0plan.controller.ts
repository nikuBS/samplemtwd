/**
 * 모바일 요금제 > 0플랜 라지 설정
 * FileName: product.setting.0plan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class ProductSetting0plan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00006157'];

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

    this.apiService.request(API_CMD.BFF_10_0034, {}, {}, prodId)
      .subscribe((ZeroPlanInfo) => {
        if (ZeroPlanInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: ZeroPlanInfo.code,
            msg: ZeroPlanInfo.msg
          }));
        }

        res.render('setting/product.setting.0plan.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          ZeroPlanInfo: ZeroPlanInfo.result
        }));
      });
  }
}

export default ProductSetting0plan;
