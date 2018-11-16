/**
 * 모바일 요금제 > 데이터 함께쓰기
 * FileName: product.join.data-together.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import ProductHelper from '../../helper/product.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class ProductJoinDataTogether extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00003556', 'NA00003557', 'NA00003558', 'NA00003958'];
  private readonly _tipIds = {
    NA00003556: 'MP_02_02_03_05_tip_01',
    NA00003557: 'MP_02_02_03_05_tip_01',
    NA00003558: 'MP_02_02_03_05_tip_01',
    NA00003958: 'MP_02_02_03_05_tip_02'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0008, {}, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0009, {})
    ).subscribe(([ basicInfo, joinTermInfo, overPayReqInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('join/product.join.data-together.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        isApp: BrowserHelper.isApp(req),
        tipId: this._tipIds[prodId]
      }));
    });
  }
}

export default ProductJoinDataTogether;
