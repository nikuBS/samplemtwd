/**
 * 모바일 부가서비스 > 리모콘
 * FileName: product.mobileplan-add.join.remote-pwd.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.15
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';

class ProductMobileplanAddJoinRemotePwd extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00000299'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: '가입'
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId)
    ).subscribe(([ basicInfo, joinTermInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('mobileplan-add/join/product.mobileplan-add.join.remote-pwd.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
      }));
    });
  }
}

export default ProductMobileplanAddJoinRemotePwd;
