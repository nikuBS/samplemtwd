/**
 * 모바일 요금제 > Data 인피니티 설정
 * FileName: product.setting.tplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class ProductSettingTplan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005959'];

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

    this.apiService.request(API_CMD.BFF_10_0013, {}, {}, prodId)
      .subscribe((benefitInfo) => {
        if (benefitInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: benefitInfo.code,
            msg: benefitInfo.msg
          }));
        }

        res.render('setting/product.setting.tplan.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          benefitInfo: benefitInfo.result
        }));
      });
  }
}

export default ProductSettingTplan;
