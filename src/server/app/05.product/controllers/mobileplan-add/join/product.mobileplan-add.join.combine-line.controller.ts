/**
 * 모바일 부가서비스 > 내폰끼리 결합
 * FileName: product.mobileplan-add.join.combine-line.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';

class ProductMobileplanAddJoinCombineLine extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00004778'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_05_0133, {}).subscribe((currentCombineInfo) => {
      if (currentCombineInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: currentCombineInfo.code,
          msg: currentCombineInfo.msg
        }));
      }

      const currentCombineList = currentCombineInfo.result.combinationMemberList.map((item) => {
        return item.prodId;
      });

      if (currentCombineList.indexOf(prodId) !== -1) {
        return this.error.render(res, renderCommonInfo);
      }

      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
        this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId]),
        this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
      ).subscribe(([ preCheckInfo, basicInfo, joinTermInfo ]) => {
        const apiError = this.error.apiError([preCheckInfo, basicInfo, joinTermInfo]);

        if (!FormatHelper.isEmpty(apiError)) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: apiError.code,
            msg: apiError.msg,
            isBackCheck: true
          }));
        }

        res.render('mobileplan-add/join/product.mobileplan-add.join.combine-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          isApp: BrowserHelper.isApp(req),
          basicInfo: basicInfo.result,
          joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
        }));
      });
    });
  }
}

export default ProductMobileplanAddJoinCombineLine;
