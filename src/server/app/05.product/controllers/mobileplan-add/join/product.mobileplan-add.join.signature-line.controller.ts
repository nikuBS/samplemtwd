/**
 * 모바일 부가서비스 > 시그니처 워치
 * FileName: product.mobileplan-add.join.signature-line.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.15
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';

class ProductMobileplanAddJoinSignatureLine extends TwViewController {
  constructor() {
    super();
  }

  private _prodIdList = ['NA00005381'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
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
        this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId]),
        this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
      ).subscribe(([ basicInfo, joinTermInfo ]) => {
        const apiError = this.error.apiError([basicInfo, joinTermInfo]);

        if (!FormatHelper.isEmpty(apiError)) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: apiError.code,
            msg: apiError.msg,
            isBackCheck: true
          }));
        }

        res.render('mobileplan-add/join/product.mobileplan-add.join.signature-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          isApp: BrowserHelper.isApp(req),
          basicInfo: basicInfo.result,
          joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
        }));
      });
    });
  }
}

export default ProductMobileplanAddJoinSignatureLine;
