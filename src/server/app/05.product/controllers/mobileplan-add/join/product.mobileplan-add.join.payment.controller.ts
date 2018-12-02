/**
 * 모바일 부가서비스 > 결제안심통보
 * FileName: product.mobileplan-add.join.payment.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.21
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';
import BFF_10_0017_mock from '../../../../../mock/server/product.BFF_10_0017.mock';

class ProductMobileplanAddJoinPayment extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005872'];

  private _getApi(): Observable<any> {
    return Observable.of(BFF_10_0017_mock);
    // this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId)
  }

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
      this._getApi()
    ).subscribe(([ basicInfo, joinTermInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('mobileplan-add/join/product.mobileplan-add.join.payment.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
      }));
    });
  }
}

export default ProductMobileplanAddJoinPayment;
